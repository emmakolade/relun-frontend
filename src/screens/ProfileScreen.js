import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import SettingsScreen from './SettingsScreen';

const { width, height } = Dimensions.get('window');

const Stack = createStackNavigator();

function ProfileViewScreen({ navigation }) {
  const [profile, setProfile] = useState({
    name: 'John',
    age: '28',
    gender: 'Male',
    bio: 'Love traveling and meeting new people!',
    segment: 'relationship',
    photos: [null, null, null],
  });
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const age = await AsyncStorage.getItem('userAge');
      const gender = await AsyncStorage.getItem('userGender');
      const bio = await AsyncStorage.getItem('userBio');
      const segment = await AsyncStorage.getItem('userSegment');
      const photos = await AsyncStorage.getItem('userPhotos');

      if (name) {
        setProfile({
          name: name || 'User',
          age: age || '25',
          gender: gender || 'Male',
          bio: bio || '',
          segment: segment || 'relationship',
          photos: photos ? JSON.parse(photos) : [null, null, null],
        });
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const pickImage = async (index) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhotos = [...profile.photos];
        newPhotos[index] = result.assets[0].uri;
        
        setProfile({ ...profile, photos: newPhotos });
        await AsyncStorage.setItem('userPhotos', JSON.stringify(newPhotos));
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const deletePhoto = async (index) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const newPhotos = [...profile.photos];
            newPhotos[index] = null;
            
            setProfile({ ...profile, photos: newPhotos });
            await AsyncStorage.setItem('userPhotos', JSON.stringify(newPhotos));
            setIsPhotoModalVisible(false);
          },
        },
      ]
    );
  };

  const viewPhoto = (index) => {
    if (profile.photos[index]) {
      setSelectedPhotoIndex(index);
      setIsPhotoModalVisible(true);
    } else {
      pickImage(index);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            // Reload the app to trigger auth check in App.js
            if (Platform.OS === 'web') {
              window.location.reload();
            } else {
              // For native, use expo-updates to reload
              try {
                const Updates = require('expo-updates');
                await Updates.reloadAsync();
              } catch (e) {
                // In development mode, show alert to manually restart
                Alert.alert(
                  'Logged Out',
                  'Please close and reopen the app to complete logout.',
                  [{ text: 'OK' }]
                );
              }
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'create-outline',
      title: 'Edit Profile',
      onPress: () => navigation.navigate('Settings', { section: 'edit' }),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Verify Photos',
      subtitle: 'Increase your matches',
      onPress: () => Alert.alert('Photo Verification', 'Photo verification feature coming soon!'),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => Alert.alert('Help', 'Contact us at support@relun.com'),
    },
    {
      icon: 'document-text-outline',
      title: 'Privacy Policy',
      onPress: () => Alert.alert('Privacy Policy', 'View our privacy policy'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      onPress: () => Alert.alert('About Relun', 'Version 1.0.0'),
    },
  ];

  const segmentColor = profile.segment === 'relationship' ? COLORS.relationship : COLORS.fun;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.photoContainer}>
            {profile.photos[0] ? (
              <Image source={{ uri: profile.photos[0] }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <Ionicons name="person" size={60} color={COLORS.white} />
              </View>
            )}
            <View style={[styles.segmentBadge, { backgroundColor: segmentColor }]}>
              <Text style={styles.segmentBadgeText}>
                {profile.segment === 'relationship' ? '💍' : '🎉'}
              </Text>
            </View>
          </View>

          <Text style={styles.profileName}>
            {profile.name}, {profile.age}
          </Text>
          
          {profile.bio && (
            <Text style={styles.profileBio}>{profile.bio}</Text>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View>
        </View>

        {/* Photos Grid */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>My Photos</Text>
          <View style={styles.photosGrid}>
            {profile.photos.map((photo, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.photoBox}
                onPress={() => viewPhoto(index)}
                activeOpacity={0.8}
              >
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="add-circle" size={40} color={COLORS.primary} />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            <Text style={styles.dangerButtonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={24} color={COLORS.error} />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ by Relun</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Photo Viewer Modal */}
      <Modal
        visible={isPhotoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" />
          
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsPhotoModalVisible(false)}
          >
            <Ionicons name="close" size={32} color={COLORS.white} />
          </TouchableOpacity>

          {/* Photo */}
          {selectedPhotoIndex !== null && profile.photos[selectedPhotoIndex] && (
            <Image 
              source={{ uri: profile.photos[selectedPhotoIndex] }} 
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalActionButton}
              onPress={() => {
                setIsPhotoModalVisible(false);
                setTimeout(() => pickImage(selectedPhotoIndex), 300);
              }}
            >
              <Ionicons name="image-outline" size={24} color={COLORS.white} />
              <Text style={styles.modalActionText}>Change Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalActionButton, styles.deleteActionButton]}
              onPress={() => deletePhoto(selectedPhotoIndex)}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
              <Text style={[styles.modalActionText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


export default function ProfileScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileView" component={ProfileViewScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  segmentBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  segmentBadgeText: {
    fontSize: 18,
  },
  profileName: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.95,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.9,
  },
  photosSection: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBox: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
  },
  addPhotoText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: 8,
  },
  menuSection: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  menuItemSubtitle: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerSection: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 24,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  dangerButtonText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  versionText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: height * 0.7,
  },
  modalActions: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: SIZES.padding,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  deleteActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalActionText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});
