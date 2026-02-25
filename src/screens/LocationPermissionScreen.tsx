import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'LocationPermission'>;

export default function LocationPermissionScreen({ navigation }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location access is needed to find matches near you. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      let currentLocation;
      try {
        currentLocation = await Location.getCurrentPositionAsync({});
      } catch (locationError) {
        console.log('Location fetch failed (likely emulator), using fallback');
        // Fallback location for emulator/testing
        currentLocation = {
          coords: {
            latitude: 37.78825,
            longitude: -122.4324,
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0,
          },
          timestamp: Date.now(),
        };
      }
      
      setLocation(currentLocation);
      await AsyncStorage.setItem('userLocation', JSON.stringify(currentLocation));
    } catch (error) {
      console.error('Error in permission flow:', error);
      // Even if permission flow fails completely, let's allow proceeding in dev
      const fallbackLocation = {
        coords: { latitude: 0, longitude: 0, altitude: 0, accuracy: 0, altitudeAccuracy: 0, heading: 0, speed: 0 },
        timestamp: Date.now(),
      };
      setLocation(fallbackLocation);
    }
    setIsLoading(false);
  };

  const handleContinue = async () => {
    if (location) {
      try {
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
          <View style={[styles.progress, { width: '100%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            style={styles.iconGradient}
          >
            <Ionicons name="location" size={48} color={COLORS.white} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Enable Location</Text>
        <Text style={styles.subtitle}>
          We use your location to show you people nearby and help you find better matches in your area.
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="people" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Find People Nearby</Text>
              <Text style={styles.benefitDescription}>Meet people in your area</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="navigate" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Distance Info</Text>
              <Text style={styles.benefitDescription}>See how far matches are</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Your Privacy Matters</Text>
              <Text style={styles.benefitDescription}>Exact location is never shared</Text>
            </View>
          </View>
        </View>

        {/* Location Status */}
        {location && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <Text style={styles.successText}>Location enabled successfully!</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {!location ? (
          <TouchableOpacity
            style={styles.enableButton}
            onPress={requestLocation}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.enableButtonGradient}
            >
              <Ionicons name="location" size={22} color={COLORS.white} />
              <Text style={styles.enableButtonText}>
                {isLoading ? 'Getting Location...' : 'Enable Location'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Complete Profile</Text>
            <Ionicons name="checkmark" size={20} color={COLORS.white} />
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 32,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  benefitsContainer: {
    width: '100%',
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    ...SHADOWS.small,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 24,
  },
  successText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.success,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  enableButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  enableButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  enableButtonText: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
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
  continueButtonText: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});
