import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // TODO: Implement actual authentication
    if (email && password) {
      await AsyncStorage.setItem('userToken', 'demo-token');
      await AsyncStorage.setItem('userEmail', email);
      // Check if user has completed profile
      const hasProfile = await AsyncStorage.getItem('hasProfile');
      if (!hasProfile) {
        navigation.navigate('SegmentSelection');
      } else {
        // User is logged in with profile - show alert and refresh
        Alert.alert(
          'Success',
          'Login successful!',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Navigate to Welcome which will trigger app reload
                navigation.navigate('Welcome');
              }
            }
          ]
        );
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Google')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Apple')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Facebook')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Should be off-white now
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
  },
  header: {
    marginTop: 20,
    marginBottom: 48,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    ...SHADOWS.small,
  },
  title: {
    fontSize: 42, // Larger
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white, // White input on off-white background
    borderRadius: SIZES.radius,
    paddingHorizontal: 20,
    marginBottom: 20, // More spacing
    height: 64, // Taller touch target
    borderWidth: 1,
    borderColor: 'transparent',
    ...SHADOWS.small, // Subtle lift
  },
  // Focused state handling would need state, but this is a static style update
  inputIcon: {
    marginRight: 16,
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    height: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary, // Less aggressive than primary color
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLarge, // Pill shape
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
    shadowColor: COLORS.primary, // Colored shadow
    shadowOpacity: 0.3,
  },
  loginButtonText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24, // Wider gap
  },
  socialButton: {
    width: 64,
    height: 64,
    borderRadius: 32, // Perfect circle
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto', // Push to bottom if space allows
    paddingVertical: 32,
  },
  signupText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  signupLink: {
    fontSize: SIZES.font,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
});
