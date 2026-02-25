import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');
const PHOTO_GAP = 10;
const PHOTO_SIZE = (width - (SIZES.padding * 2) - (PHOTO_GAP * 2)) / 3;

type Props = StackScreenProps<RootStackParamList, 'PhotoUpload'>;

export default function PhotoUploadScreen({ navigation }: Props) {
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null, null]);

  const pickImage = async (index: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhotos = [...photos];
        newPhotos[index] = result.assets[0].uri;
        setPhotos(newPhotos);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const photoCount = photos.filter((p) => p !== null).length;
  const hasMinPhotos = photoCount >= 3;
  const progress = Math.min((photoCount / 3) * 100, 100);

  const handleContinue = async () => {
    if (hasMinPhotos) {
      try {
        await AsyncStorage.setItem('userPhotos', JSON.stringify(photos.filter(p => p !== null)));
        
        // Complete profile
        await AsyncStorage.setItem('hasProfile', 'true');
        await AsyncStorage.setItem('userToken', 'demo-token');
        
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          })
        );
      } catch (error) {
        console.error('Error completing profile:', error);
        Alert.alert('Error', 'Failed to complete profile. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Add Your Photos</Text>
        <Text style={styles.subtitle}>
          Add at least 3 photos to continue. Show your best self!
        </Text>

        {/* Photo Grid - 2 rows of 3 */}
        <View style={styles.photoGrid}>
          {/* First row */}
          <View style={styles.photoRow}>
            {photos.slice(0, 3).map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.photoBox, photo && styles.photoBoxFilled]}
                onPress={() => pickImage(index)}
                activeOpacity={0.7}
              >
                {photo ? (
                  <>
                    <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.placeholderContent}>
                    <Ionicons name="add" size={28} color={COLORS.textLight} />
                  </View>
                )}
                {index === 0 && !photo && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Main</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Second row */}
          <View style={styles.photoRow}>
            {photos.slice(3, 6).map((photo, index) => (
              <TouchableOpacity
                key={index + 3}
                style={[styles.photoBox, photo && styles.photoBoxFilled]}
                onPress={() => pickImage(index + 3)}
                activeOpacity={0.7}
              >
                {photo ? (
                  <>
                    <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removePhoto(index + 3)}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.placeholderContent}>
                    <Ionicons name="add" size={28} color={COLORS.textLight} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photo Count Indicator */}
        <View style={styles.countContainer}>
          <Text style={[styles.countText, hasMinPhotos && styles.countTextSuccess]}>
            {photoCount}/6 photos
          </Text>
          {!hasMinPhotos && (
            <Text style={styles.countHint}>
              Add {3 - photoCount} more {3 - photoCount === 1 ? 'photo' : 'photos'}
            </Text>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for great photos:</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Clear face shots</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Recent photos</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Smile!</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !hasMinPhotos && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!hasMinPhotos}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Complete Profile</Text>
          <Ionicons name="checkmark" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.small,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  photoGrid: {
    gap: PHOTO_GAP,
    marginBottom: 20,
  },
  photoRow: {
    flexDirection: 'row',
    gap: PHOTO_GAP,
  },
  photoBox: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE * 1.25,
    borderRadius: 16,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  photoBoxFilled: {
    borderStyle: 'solid',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mainBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  countTextSuccess: {
    color: COLORS.success,
  },
  countHint: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.small,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 12,
  },
  tipsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.medium,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});
