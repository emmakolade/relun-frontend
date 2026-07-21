import React, { useState, useEffect, ComponentProps } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import SettingsScreen from './SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import { useToast, ConfirmDialog } from '../components';
import { clearAuthSession, logout } from '../services/auth.service';
import {
  deleteProfilePhoto,
  getCurrentUserProfileDetails,
  getReceivedLikes,
  replaceProfilePhoto,
  uploadProfilePhotos,
} from '../services/profile.service';
import { User } from '../types';

const { width, height } = Dimensions.get('window');

const MOCK_VIEWS = [
  { id: 'v1', name: 'Sarah', age: 28, photo: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 'v2', name: 'Jessica', age: 29, photo: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: 'v3', name: 'Emma', age: 26, photo: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 'v4', name: 'Sophia', age: 24, photo: 'https://randomuser.me/api/portraits/women/8.jpg' },
  { id: 'v5', name: 'Olivia', age: 25, photo: 'https://randomuser.me/api/portraits/women/6.jpg' },
  { id: 'v6', name: 'Ava', age: 23, photo: 'https://randomuser.me/api/portraits/women/9.jpg' },
  { id: 'v7', name: 'Mia', age: 27, photo: 'https://randomuser.me/api/portraits/women/11.jpg' },
  { id: 'v15', name: 'Luna', age: 22, photo: 'https://randomuser.me/api/portraits/women/27.jpg' },
  { id: 'v16', name: 'Chloe', age: 26, photo: 'https://randomuser.me/api/portraits/women/29.jpg' },
  { id: 'v17', name: 'Penelope', age: 24, photo: 'https://randomuser.me/api/portraits/women/31.jpg' },
  { id: 'v18', name: 'Layla', age: 25, photo: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { id: 'v19', name: 'Riley', age: 23, photo: 'https://randomuser.me/api/portraits/women/35.jpg' },
  { id: 'v20', name: 'Zoey', age: 27, photo: 'https://randomuser.me/api/portraits/women/37.jpg' },
  { id: 'v21', name: 'Nora', age: 26, photo: 'https://randomuser.me/api/portraits/women/39.jpg' },
  { id: 'v22', name: 'Lily', age: 24, photo: 'https://randomuser.me/api/portraits/women/41.jpg' },
  // ... more can be added
];

export type ProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
  Settings: { section?: string } | undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

type ProfileViewProps = StackScreenProps<ProfileStackParamList, 'ProfileView'>;

interface UserProfile {
  name: string;
  age: string;
  gender: string;
  bio: string;
  segment: string;
  photos: (string | null)[];
}

type ProfilePhotoSlot = {
  id: string;
  url: string;
};

interface MenuItem {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function ProfileViewScreen({ navigation }: ProfileViewProps) {
  const rootNavigation = useNavigation<any>();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John',
    age: '28',
    gender: 'Male',
    bio: 'Love traveling and meeting new people!',
    segment: 'relationship',
    photos: [null, null, null],
  });
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [coinBalance, setCoinBalance] = useState(100); // Mock balance
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showViewsModal, setShowViewsModal] = useState(false);
  const [receivedLikes, setReceivedLikes] = useState<User[]>([]);
  const [photoSlots, setPhotoSlots] = useState<(ProfilePhotoSlot | null)[]>([null, null, null]);
  const [insightsSubscriptionExpiry, setInsightsSubscriptionExpiry] = useState<Date | null>(null);
  
  // Dialog States
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showNotEnoughCoinsDialog, setShowNotEnoughCoinsDialog] = useState(false);
  const [pendingShowModal, setPendingShowModal] = useState<(() => void) | null>(null);
  
  const { showToast } = useToast();

  const INSIGHTS_MONTHLY_COST = 20;

  const isInsightsActive = () => {
    if (!insightsSubscriptionExpiry) return false;
    return new Date() < insightsSubscriptionExpiry;
  };

  const getDaysRemaining = () => {
    if (!insightsSubscriptionExpiry) return 0;
    const diff = insightsSubscriptionExpiry.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    loadProfile();
    void loadReceivedLikes();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void loadProfile();
    });

    return unsubscribe;
  }, [navigation]);

  const loadReceivedLikes = async () => {
    try {
      const likes = await getReceivedLikes(100);
      setReceivedLikes(likes);
    } catch (error) {
      console.log('Error loading received likes:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const apiProfile = await getCurrentUserProfileDetails();

      if (apiProfile.name) {
        const firstThreeSlots = [0, 1, 2].map((index) => {
          const photo = apiProfile.photoDetails[index];
          return photo ? { id: photo.id, url: photo.url } : null;
        });

        setPhotoSlots(firstThreeSlots);

        setProfile(apiProfile);

        await AsyncStorage.multiSet([
          ['userName', apiProfile.name],
          ['userAge', apiProfile.age],
          ['userGender', apiProfile.gender],
          ['userBio', apiProfile.bio],
          ['userSegment', apiProfile.segment],
          ['userPhotos', JSON.stringify(apiProfile.photos)],
        ]);

        return;
      }

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

  const pickImage = async (index: number): Promise<void> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showToast({
          type: 'warning',
          title: 'Permission needed',
          message: 'Please grant camera roll permissions to add photos.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedUri = result.assets[0].uri;
        const existingSlot = photoSlots[index];

        if (existingSlot?.id) {
          await replaceProfilePhoto(existingSlot.id, selectedUri);
          await loadProfile();
          showToast({
            type: 'success',
            title: 'Photo updated',
            message: 'Your photo was changed successfully.',
          });
          return;
        }

        await uploadProfilePhotos([selectedUri]);
        await loadProfile();
        showToast({
          type: 'success',
          title: 'Photo uploaded',
          message: 'Your photo was uploaded successfully.',
        });
      }
    } catch (error) {
      console.log('Error picking image:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to pick image. Please try again.',
      });
    }
  };

  const deletePhoto = async (index: number): Promise<void> => {
    setShowDeletePhotoDialog(true);
  };

  const confirmDeletePhoto = async (): Promise<void> => {
    if (selectedPhotoIndex !== null) {
      const slot = photoSlots[selectedPhotoIndex];

      if (slot?.id) {
        await deleteProfilePhoto(slot.id);
        await loadProfile();
        showToast({
          type: 'success',
          title: 'Photo deleted',
          message: 'Your photo was removed successfully.',
        });
      }

      setIsPhotoModalVisible(false);
    }
    setShowDeletePhotoDialog(false);
  };

  const viewPhoto = (index: number): void => {
    if (profile.photos[index]) {
      setSelectedPhotoIndex(index);
      setIsPhotoModalVisible(true);
    } else {
      pickImage(index);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    try {
      await logout();
    } catch (error) {
      // Logout should still continue locally if backend is unreachable.
      console.log('Remote logout failed:', error);
    }

    await clearAuthSession();
    await AsyncStorage.multiRemove([
      'userName',
      'userAge',
      'userGender',
      'userBio',
      'userSegment',
      'userPhotos',
      'userLocation',
    ]);

    showToast({
      type: 'success',
      title: 'Logged Out',
      message: 'You have been logged out.',
    });
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccountDialog(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteAccountDialog(false);
    await AsyncStorage.clear();
    showToast({
      type: 'info',
      title: 'Account Deleted',
      message: 'Your account has been deleted.',
    });
  };

  const handleSubscribe = (showModal: () => void) => {
    if (isInsightsActive()) {
      // Subscription is active, show modal directly
      showModal();
    } else {
      // Need to subscribe
      if (coinBalance >= INSIGHTS_MONTHLY_COST) {
        setPendingShowModal(() => showModal);
        setShowSubscribeDialog(true);
      } else {
        setShowNotEnoughCoinsDialog(true);
      }
    }
  };

  const confirmSubscribe = () => {
    setShowSubscribeDialog(false);
    setCoinBalance(prev => prev - INSIGHTS_MONTHLY_COST);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    setInsightsSubscriptionExpiry(expiryDate);
    showToast({
      type: 'success',
      title: 'Subscribed!',
      message: 'You now have access to Likes and Views for 30 days.',
    });
    if (pendingShowModal) {
      setTimeout(() => pendingShowModal(), 500);
      setPendingShowModal(null);
    }
  };

  const handleViewLikes = () => {
    handleSubscribe(() => {
      void loadReceivedLikes();
      setShowLikesModal(true);
    });
  };

  const handleViewViews = () => {
    handleSubscribe(() => setShowViewsModal(true));
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'card-outline',
      title: 'Get Coins',
      subtitle: 'Top up your balance',
      onPress: () => navigation.navigate('GetCoins' as never),
    },
    {
      icon: 'create-outline',
      title: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Verification',
      subtitle: 'Increase your matches',
      onPress: () => showToast({ type: 'info', title: 'Coming Soon', message: 'Verification feature coming soon!' }),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => showToast({ type: 'info', title: 'Help & Support', message: 'Contact us at support@relun.com' }),
    },
    {
      icon: 'document-text-outline',
      title: 'Privacy Policy',
      onPress: () => showToast({ type: 'info', title: 'Privacy Policy', message: 'Privacy policy available in settings' }),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      onPress: () => showToast({ type: 'info', title: 'About Relun', message: 'Version 1.0.0' }),
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
              <Ionicons 
                name={profile.segment === 'relationship' ? 'heart' : 'sparkles'} 
                size={16} 
                color={COLORS.white} 
              />
            </View>
          </View>

          <Text style={styles.profileName}>
            {profile.name}, {profile.age}
          </Text>
          
          {profile.bio && (
            <Text style={styles.profileBio}>{profile.bio}</Text>
          )}

          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem} onPress={() => handleViewLikes()}>
              <Text style={styles.statValue}>{receivedLikes.length}</Text>
              <Text style={styles.statLabel}>Likes</Text>
              {isInsightsActive() ? (
                <Text style={[styles.statCost, { color: COLORS.success }]}>Unlocked ✓</Text>
              ) : (
                <Text style={styles.statCost}>Tap to unlock</Text>
              )}
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => handleViewViews()}>
              <Text style={styles.statValue}>{MOCK_VIEWS.length}</Text>
              <Text style={styles.statLabel}>Views</Text>
              {isInsightsActive() ? (
                <Text style={[styles.statCost, { color: COLORS.success }]}>Unlocked ✓</Text>
              ) : (
                <Text style={styles.statCost}>Tap to unlock</Text>
              )}
            </TouchableOpacity>
          </View>
          {isInsightsActive() && (
            <View style={styles.subscriptionBadge}>
              <Text style={styles.subscriptionText}>
                Insights active • {getDaysRemaining()} days remaining
              </Text>
            </View>
          )}
          {!isInsightsActive() && (
            <View style={[styles.subscriptionBadge, { backgroundColor: COLORS.grayLight }]}>
              <Text style={[styles.subscriptionText, { color: COLORS.textSecondary }]}>
                Unlock Likes & Views for {INSIGHTS_MONTHLY_COST} coins/month
              </Text>
            </View>
          )}
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
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Made with </Text>
            <Ionicons name="heart" size={14} color={COLORS.primary} />
            <Text style={styles.footerText}> by Relun</Text>
          </View>
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
                setTimeout(() => selectedPhotoIndex !== null && pickImage(selectedPhotoIndex), 300);
              }}
            >
              <Ionicons name="image-outline" size={24} color={COLORS.white} />
              <Text style={styles.modalActionText}>Change Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalActionButton, styles.deleteActionButton]}
              onPress={() => selectedPhotoIndex !== null && deletePhoto(selectedPhotoIndex)}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
              <Text style={[styles.modalActionText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Likes Modal */}
      <Modal
        visible={showLikesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLikesModal(false)}
      >
        <View style={styles.likesModalOverlay}>
          <View style={styles.likesModalContent}>
            <View style={styles.likesModalHeader}>
              <Text style={styles.likesModalTitle}>Who Liked You</Text>
              <TouchableOpacity onPress={() => setShowLikesModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={receivedLikes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.likeItem}
                  onPress={() => {
                    setShowLikesModal(false);
                    rootNavigation.dispatch(
                      CommonActions.navigate({
                        name: 'ProfileView',
                        params: { 
                          user: { 
                            id: item.id, 
                            name: item.name, 
                            age: item.age, 
                            photos: item.photos && item.photos.length > 0 ? item.photos : ['https://via.placeholder.com/400'],
                            bio: item.bio || 'Interested in you!', 
                            segment: item.segment || 'relationship',
                            gender: item.gender,
                            location: item.location,
                          } 
                        }
                      })
                    );
                  }}
                >
                  <Image
                    source={{ uri: item.photos && item.photos.length > 0 ? item.photos[0] : 'https://via.placeholder.com/400' }}
                    style={styles.likeAvatar}
                  />
                  <View style={styles.likeInfo}>
                    <Text style={styles.likeName}>{item.name}, {item.age}</Text>
                    <Text style={styles.likeSubtext}>Liked you</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyLikesText}>No likes yet.</Text>}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Views Modal */}
      <Modal
        visible={showViewsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowViewsModal(false)}
      >
        <View style={styles.likesModalOverlay}>
          <View style={styles.likesModalContent}>
            <View style={styles.likesModalHeader}>
              <Text style={styles.likesModalTitle}>Profile Views</Text>
              <TouchableOpacity onPress={() => setShowViewsModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={MOCK_VIEWS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.likeItem}
                  onPress={() => {
                    setShowViewsModal(false);
                    rootNavigation.dispatch(
                      CommonActions.navigate({
                        name: 'ProfileView',
                        params: { 
                          user: { 
                            id: item.id, 
                            name: item.name, 
                            age: item.age, 
                            photos: [item.photo], 
                            bio: 'Checked out your profile!', 
                            segment: 'fun' 
                          } 
                        }
                      })
                    );
                  }}
                >
                  <Image source={{ uri: item.photo }} style={styles.likeAvatar} />
                  <View style={styles.likeInfo}>
                    <Text style={styles.likeName}>{item.name}, {item.age}</Text>
                    <Text style={styles.likeSubtext}>Viewed your profile</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        visible={showDeletePhotoDialog}
        title="Delete Photo"
        message="Are you sure you want to delete this photo?"
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={confirmDeletePhoto}
        onCancel={() => setShowDeletePhotoDialog(false)}
      />

      <ConfirmDialog
        visible={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <ConfirmDialog
        visible={showDeleteAccountDialog}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteAccountDialog(false)}
      />

      <ConfirmDialog
        visible={showSubscribeDialog}
        title="Unlock Insights"
        message={`Subscribe for ${INSIGHTS_MONTHLY_COST} coins/month to see who likes you and who views your profile. This unlocks both features for 30 days.`}
        confirmText="Subscribe Now!"
        cancelText="Cancel"
        onConfirm={confirmSubscribe}
        onCancel={() => {
          setShowSubscribeDialog(false);
          setPendingShowModal(null);
        }}
      />

      <ConfirmDialog
        visible={showNotEnoughCoinsDialog}
        title="Not Enough Coins"
        message={`You need ${INSIGHTS_MONTHLY_COST} coins to subscribe. Get more coins?`}
        confirmText="Get Coins"
        cancelText="Cancel"
        onConfirm={() => {
          setShowNotEnoughCoinsDialog(false);
          rootNavigation.navigate('GetCoins');
        }}
        onCancel={() => setShowNotEnoughCoinsDialog(false)}
      />
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
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Off-white
  },
  profileHeader: {
    backgroundColor: COLORS.background, // Removed pink background
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
    // Removed radius - clean header
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 20,
    ...SHADOWS.medium, // Better shadow
  },
  profilePhoto: {
    width: 128, // Slightly larger
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profilePhotoPlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  segmentBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary, // Using primary color for badge bg
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  segmentBadgeText: {
    fontSize: 20,
  },
  profileName: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text, // Dark text
    marginBottom: 4,
  },
  profileBio: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white, // White card
    borderRadius: SIZES.radiusLarge,
    paddingVertical: 20,
    paddingHorizontal: 32,
    ...SHADOWS.small,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium, // Changed to medium
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photosSection: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 16, // More gap
  },
  photoBox: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    backgroundColor: COLORS.grayLight,
    ...SHADOWS.small,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
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
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge, // Modern curve
    padding: 20, // More padding
    marginBottom: 0, // Handled by gap
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
    borderRadius: 24, // Circle
    backgroundColor: COLORS.grayLight, // Subtle bg
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerSection: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 24,
    paddingBottom: 40,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  footerText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  emptyLikesText: {
    textAlign: 'center',
    marginTop: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
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
  // Stats cost indicator
  statCost: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
    marginTop: 2,
  },
  // Subscription badge
  subscriptionBadge: {
    backgroundColor: 'rgba(255, 75, 125, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  subscriptionText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  // Likes/Views Modal Styles
  likesModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  likesModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
    paddingBottom: 40,
  },
  likesModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  likesModalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  likeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  likeInfo: {
    flex: 1,
  },
  likeName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  likeSubtext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
