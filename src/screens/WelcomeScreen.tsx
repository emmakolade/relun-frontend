import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  useEffect(() => {
    // Check if user is already logged in when screen mounts
    checkIfLoggedIn();
  }, []);

  const checkIfLoggedIn = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // User is logged in, this will trigger App.js to re-render and show Main
        // Force a re-check by navigating to itself
        setTimeout(() => {
          // App.js will detect token and show Main navigator
        }, 0);
      }
    } catch (error) {
      console.log('Error checking login:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="heart" size={80} color={COLORS.white} />
            </View>
            <Text style={styles.appName}>relun</Text>
            <Text style={styles.tagline}>Find Your Match, Your Way</Text>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <Text style={styles.description}>
              Connect with people who share your relationship intentions
            </Text>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('OTPVerification', { method: 'email' })}
              activeOpacity={0.9}
            >
              <Ionicons name="mail" size={20} color={COLORS.primary} style={styles.buttonIcon} />
              <Text style={styles.continueButtonText}>Continue with Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('OTPVerification', { method: 'phone' })}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={20} color={COLORS.white} style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Continue with Phone</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: SIZES.height > 800 ? SIZES.padding * 2 : SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: SIZES.height > 800 ? 80 : 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 40, // Modern squircle
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // More subtle glass
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appName: {
    fontSize: 48,
    fontFamily: FONTS.logo,
    color: COLORS.white,
    marginBottom: SIZES.base,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: SIZES.padding,
  },
  description: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SIZES.margin * 1.5,
    lineHeight: 24,
    paddingHorizontal: SIZES.padding,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: SIZES.radiusLarge,
    width: '100%',
    marginBottom: SIZES.margin,
    ...SHADOWS.medium,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: SIZES.radiusLarge,
    width: '100%',
    marginBottom: SIZES.margin,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonIcon: {
    marginRight: 12,
  },
  continueButtonText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary, // Coral color text
  },
  secondaryButtonText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  termsText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: SIZES.base,
    paddingHorizontal: SIZES.padding,
  },
});
