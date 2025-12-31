import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

export default function WelcomeScreen({ navigation }) {
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
              style={styles.startButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
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
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: SIZES.radiusLarge,
    width: '100%',
    ...SHADOWS.medium,
  },
  startButtonText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
    marginRight: 12,
  },
  loginLink: {
    marginTop: 24,
  },
  loginText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  loginTextBold: {
    fontFamily: FONTS.bold,
  },
});
