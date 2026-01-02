import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PhotoUploadScreen({ navigation }) {
  const [photos, setPhotos] = useState([null, null, null]);
  const [location, setLocation] = useState(null);
  
  const checkLoginStatus = async () => {
    // Helper to trigger app reload by navigating
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      // User is logged in - force a hard reset
      // This is a workaround; ideally use Context API
    }
  };

  const pickImage = async (index) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
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

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access location');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    Alert.alert('Success', 'Location enabled successfully');
  };

  const calculateProgress = () => {
    const photoCount = photos.filter((p) => p !== null).length;
    const photoProgress = (photoCount / 3) * 75;
    const locationProgress = location ? 25 : 0;
    return photoProgress + locationProgress;
  };

  const progress = calculateProgress();
  const hasMinPhotos = photos.filter((p) => p !== null).length >= 1;
  const isValid = hasMinPhotos && location;

  const handleFinish = async () => {
    if (isValid) {
      try {
        await AsyncStorage.setItem('userPhotos', JSON.stringify(photos));
        await AsyncStorage.setItem('userLocation', JSON.stringify(location));
        await AsyncStorage.setItem('hasProfile', 'true');
        await AsyncStorage.setItem('userToken', 'demo-token');
        
        // App.js interval will detect the token and automatically show Main navigator (Swipe screen)
        // Just stay on current screen or navigate to Welcome - the interval will handle the rest
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
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Add Your Photos</Text>
          <Text style={styles.subtitle}>
            Upload at least 1 photo. You can add up to 3 photos.
          </Text>

          {/* Photo Grid */}
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <TouchableOpacity
                  style={[styles.photoBox, photo && styles.photoBoxFilled]}
                  onPress={() => pickImage(index)}
                  activeOpacity={0.7}
                >
                  {photo ? (
                    <>
                      <Image source={{ uri: photo }} style={styles.photo} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removePhoto(index)}
                      >
                        <Ionicons name="close-circle" size={28} color={COLORS.error} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.placeholderContent}>
                      <Ionicons name="camera" size={32} color={COLORS.textLight} />
                      <Text style={styles.placeholderText}>
                        {index === 0 ? 'Main Photo' : `Photo ${index + 1}`}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {index === 0 && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Photo Tips */}
          <View style={styles.tipsContainer}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Photo Guidelines:</Text>
              <Text style={styles.tipText}>• Show your face clearly</Text>
              <Text style={styles.tipText}>• Use recent photos</Text>
              <Text style={styles.tipText}>• Smile and be yourself!</Text>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enable Location</Text>
            <Text style={styles.sectionSubtitle}>
              Help us find matches near you
            </Text>
            
            <TouchableOpacity
              style={[styles.locationButton, location && styles.locationButtonEnabled]}
              onPress={requestLocation}
              activeOpacity={0.8}
            >
              <Ionicons
                name={location ? 'location' : 'location-outline'}
                size={24}
                color={location ? COLORS.white : COLORS.primary}
              />
              <Text style={[styles.locationButtonText, location && styles.locationButtonTextEnabled]}>
                {location ? 'Location Enabled' : 'Enable Location'}
              </Text>
              {location && <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />}
            </TouchableOpacity>
          </View>

          {/* Verification Notice */}
          <View style={styles.verificationNotice}>
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.success} />
            <Text style={styles.verificationText}>
              Photo verification will be available in your profile settings after signup
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Finish Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.finishButton, !isValid && styles.disabledButton]}
          onPress={handleFinish}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={styles.finishButtonText}>Complete Profile</Text>
          <Ionicons name="checkmark" size={20} color={COLORS.white} />
        </TouchableOpacity>
        
        {!isValid && (
          <Text style={styles.footerHint}>
            {!hasMinPhotos && '• Add at least 1 photo\n'}
            {!location && '• Enable location'}
          </Text>
        )}
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
    paddingTop: 50,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.grayLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
  },
  content: {
    paddingBottom: 20,
  },
  title: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  photoGrid: {
    gap: 12,
    marginBottom: 24,
  },
  photoContainer: {
    position: 'relative',
  },
  photoBox: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.gray,
    borderStyle: 'dashed',
  },
  photoBoxFilled: {
    borderStyle: 'solid',
    borderColor: COLORS.primary,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderContent: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    ...SHADOWS.medium,
  },
  requiredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  requiredText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: SIZES.radius,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    gap: 12,
  },
  locationButtonEnabled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  locationButtonText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  locationButtonTextEnabled: {
    color: COLORS.white,
  },
  verificationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: SIZES.radius,
    padding: 16,
    gap: 12,
  },
  verificationText: {
    flex: 1,
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  finishButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
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
  finishButtonText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  footerHint: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
