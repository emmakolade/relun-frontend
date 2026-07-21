import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { ConfirmDialog, useToast } from '../components';
import {
  deleteProfilePhoto,
  getCurrentUserProfileDetails,
  replaceProfilePhoto,
  updateEditableProfile,
  uploadProfilePhotos,
} from '../services/profile.service';

type Props = StackScreenProps<any, 'EditProfile'>;

type ProfilePhotoSlot = {
  id: string;
  url: string;
};

const maskEmail = (email?: string) => {
  if (!email) return 'Not set';
  const [namePart, domainPart] = email.split('@');
  if (!namePart || !domainPart) return 'Not set';

  if (namePart.length <= 2) {
    return `${namePart[0] || '*'}****@${domainPart}`;
  }

  return `${namePart.slice(0, 2)}****@${domainPart}`;
};

const maskPhone = (phone?: string) => {
  if (!phone) return 'Not set';

  const clean = phone.replace(/\s+/g, '');
  if (clean.length <= 4) return '****';

  const visibleStart = clean.slice(0, 3);
  const visibleEnd = clean.slice(-2);
  return `${visibleStart}*****${visibleEnd}`;
};

export default function EditProfileScreen({ navigation }: Props) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [photoSlots, setPhotoSlots] = useState<(ProfilePhotoSlot | null)[]>([null, null, null]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getCurrentUserProfileDetails();

      const firstThreeSlots = [0, 1, 2].map((index) => {
        const photo = data.photoDetails[index];
        return photo ? { id: photo.id, url: photo.url } : null;
      });

      const filledPhotos = [0, 1, 2].map((index) => data.photos[index] || null);

      setName(data.name || '');
      setBio(data.bio || '');
      setAge(data.age || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setPhotos(filledPhotos);
      setPhotoSlots(firstThreeSlots);

      await AsyncStorage.multiSet([
        ['userName', data.name || ''],
        ['userAge', data.age || ''],
        ['userBio', data.bio || ''],
        ['userPhotos', JSON.stringify(filledPhotos)],
      ]);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load profile',
      });
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      showToast({
        type: 'error',
        title: 'Missing name',
        message: 'Please enter your name before saving.',
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateEditableProfile({ fullName: trimmedName, bio: trimmedBio });
      await AsyncStorage.multiSet([
        ['userName', trimmedName],
        ['userBio', trimmedBio],
      ]);

      showToast({
        type: 'success',
        title: 'Saved',
        message: 'Your profile was updated successfully.',
      });

      navigation.goBack();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async (index: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        showToast({
          type: 'warning',
          title: 'Permission needed',
          message: 'Please grant media permissions to add photos.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const selectedUri = result.assets[0].uri;
      const slot = photoSlots[index];

      if (slot?.id) {
        await replaceProfilePhoto(slot.id, selectedUri);
        showToast({
          type: 'success',
          title: 'Photo updated',
          message: 'Your photo was changed successfully.',
        });
      } else {
        await uploadProfilePhotos([selectedUri]);
        showToast({
          type: 'success',
          title: 'Photo uploaded',
          message: 'Your photo was uploaded successfully.',
        });
      }

      await loadProfile();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update photo',
      });
    }
  };

  const openPhoto = (index: number) => {
    if (!photos[index]) {
      void pickImage(index);
      return;
    }

    setSelectedPhotoIndex(index);
    setIsPhotoModalVisible(true);
  };

  const confirmDeletePhoto = async () => {
    if (selectedPhotoIndex === null) {
      setShowDeletePhotoDialog(false);
      return;
    }

    const slot = photoSlots[selectedPhotoIndex];

    try {
      if (slot?.id) {
        await deleteProfilePhoto(slot.id);
        showToast({
          type: 'success',
          title: 'Photo deleted',
          message: 'Your photo was removed successfully.',
        });
        await loadProfile();
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete photo',
      });
    } finally {
      setShowDeletePhotoDialog(false);
      setIsPhotoModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <TouchableOpacity key={index} style={styles.photoBox} onPress={() => openPhoto(index)}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="add-circle" size={34} color={COLORS.primary} />
                    <Text style={styles.addPhotoText}>Upload</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Info</Text>

          <Text style={styles.nameAgeDisplay}>{name || 'Your name'}, {age || '--'}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <View style={[styles.inputContainer, styles.bioContainer]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Write a short bio..."
                placeholderTextColor={COLORS.textLight}
                multiline
                maxLength={150}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>

          <View style={styles.readonlyItem}>
            <Text style={styles.readonlyLabel}>Email</Text>
            <Text style={styles.readonlyValue}>{maskEmail(email)}</Text>
          </View>

          <View style={styles.readonlyItem}>
            <Text style={styles.readonlyLabel}>Phone</Text>
            <Text style={styles.readonlyValue}>{maskPhone(phone)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsPhotoModalVisible(false)}>
            <Ionicons name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>

          {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
            <Image source={{ uri: photos[selectedPhotoIndex] as string }} style={styles.modalImage} resizeMode="contain" />
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setIsPhotoModalVisible(false);
                setTimeout(() => {
                  if (selectedPhotoIndex !== null) {
                    void pickImage(selectedPhotoIndex);
                  }
                }, 250);
              }}
            >
              <Ionicons name="image-outline" size={22} color={COLORS.white} />
              <Text style={styles.modalActionText}>Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalActionButton, styles.deleteActionButton]}
              onPress={() => setShowDeletePhotoDialog(true)}
            >
              <Ionicons name="trash-outline" size={22} color={COLORS.error} />
              <Text style={[styles.modalActionText, { color: COLORS.error }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={showDeletePhotoDialog}
        title="Delete Photo"
        message="Are you sure you want to remove this photo?"
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={() => void confirmDeletePhoto()}
        onCancel={() => setShowDeletePhotoDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 14,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBox: {
    width: '31%',
    aspectRatio: 0.75,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPhotoText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
  nameAgeDisplay: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    minHeight: 52,
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  input: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  bioContainer: {
    minHeight: 110,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  bioInput: {
    width: '100%',
    minHeight: 86,
  },
  charCount: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  readonlyItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  readonlyLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    fontFamily: FONTS.medium,
    marginBottom: 2,
  },
  readonlyValue: {
    fontSize: SIZES.body1,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 22,
    zIndex: 2,
  },
  modalImage: {
    width: '92%',
    height: '62%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  deleteActionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalActionText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
  },
});
