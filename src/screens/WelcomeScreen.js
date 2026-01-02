import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

export default function WelcomeScreen({ navigation }) {
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
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={24} color={COLORS.primary} style={styles.buttonIcon} />
              <Text style={styles.continueButtonText}>Continue with Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('OTPVerification', { method: 'phone' })}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={24} color={COLORS.primary} style={styles.buttonIcon} />
              <Text style={styles.continueButtonText}>Continue with Phone</Text>
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
    paddingVertical: 60,
    paddingHorizontal: SIZES.padding,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 80,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 56,
    fontFamily: FONTS.logo,
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: SIZES.h5,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.9,
  },
  bottomSection: {
    alignItems: 'center',
  },
  description: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.95,
    paddingHorizontal: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: SIZES.radiusLarge,
    width: '100%',
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  buttonIcon: {
    marginRight: 12,
  },
  continueButtonText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  termsText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
    paddingHorizontal: 20,
  },
});
