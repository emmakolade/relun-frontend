import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../components';
import { persistAuthSession, requestOtp, verifyOtp } from '../services/auth.service';

import { RootStackParamList } from '../types';
import { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<RootStackParamList, 'OTPVerification'>;

const OTP_LENGTH = 6;

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const { method, prefilledContact, autoRequestOtp } = route.params; // 'email' or 'phone'
  const [contact, setContact] = useState<string>(prefilledContact || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputs = useRef<(TextInput | null)[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (autoRequestOtp && prefilledContact) {
      void handleSendOTP(prefilledContact);
    }
    // Only on mount for this route instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\d{10,}$/.test(phone.replace(/[\s-]/g, ''));
  };

  const handleSendOTP = async (value?: string) => {
    const normalizedContact = (value || contact).trim();

    if (method === 'email' && !isValidEmail(normalizedContact)) {
      showToast({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address',
      });
      return;
    }
    
    if (method === 'phone' && !isValidPhone(normalizedContact)) {
      showToast({
        type: 'error',
        title: 'Invalid Phone',
        message: 'Please enter a valid phone number',
      });
      return;
    }

    try {
      setIsRequestingOtp(true);
      const payload =
        method === 'email'
          ? { email: normalizedContact.toLowerCase() }
          : { phone: normalizedContact };

      await requestOtp(payload);

      setContact(normalizedContact);
      setOtpSent(true);
      showToast({
        type: 'success',
        title: 'OTP Sent',
        message: `A verification code has been sent to your ${method}`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to send OTP',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');

    // Single character: normal typing.
    if (digits.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = digits;
      setOtp(newOtp);

      // Auto-focus next input
      if (digits && index < OTP_LENGTH - 1) {
        otpInputs.current[index + 1]?.focus();
      }
      return;
    }

    // Multiple characters: the code was pasted or autofilled. Spread it across
    // the boxes. Android can append to the box's existing digit, so keep only
    // the last OTP_LENGTH digits, and a full-length code always fills from the
    // first box regardless of which one received it.
    const incoming = digits.slice(-OTP_LENGTH);
    const startIndex = incoming.length >= OTP_LENGTH ? 0 : index;

    const newOtp = [...otp];
    incoming.split('').forEach((digit, offset) => {
      if (startIndex + offset < OTP_LENGTH) {
        newOtp[startIndex + offset] = digit;
      }
    });
    setOtp(newOtp);

    otpInputs.current[Math.min(startIndex + incoming.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast({
        type: 'warning',
        title: 'Invalid OTP',
        message: 'Please enter the complete 6-digit code',
      });
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const payload =
        method === 'email'
          ? { email: contact.toLowerCase(), otp: otpCode }
          : { phone: contact, otp: otpCode };

      const authData = await verifyOtp(payload);

      await persistAuthSession(authData, method, contact);

      await AsyncStorage.setItem('authMethod', method);
      if (method === 'email') {
        await AsyncStorage.setItem('userEmail', contact);
      } else {
        await AsyncStorage.setItem('userPhone', contact);
      }

      if (authData.needsProfileCompletion) {
        navigation.navigate('SegmentSelection');
      } else {
        // App.tsx will switch to the main app stack when auth/profile state is complete.
        return;
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Verification failed',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={method === 'email' ? 'mail' : 'call'} 
            size={60} 
            color={COLORS.primary} 
          />
        </View>

        <Text style={styles.title}>
          {otpSent ? 'Verify Your Code' : `Enter Your ${method === 'email' ? 'Email' : 'Phone Number'}`}
        </Text>
        
        <Text style={styles.subtitle}>
          {otpSent 
            ? `We've sent a 6-digit code to ${contact}`
            : `We'll send you a verification code`
          }
        </Text>

        {!otpSent ? (
          <>
            {/* Contact Input */}
            <View style={styles.inputContainer}>
              <Ionicons 
                name={method === 'email' ? 'mail-outline' : 'call-outline'} 
                size={20} 
                color={COLORS.textSecondary} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder={method === 'email' ? 'your@email.com' : '+1234567890'}
                placeholderTextColor={COLORS.textLight}
                value={contact}
                onChangeText={setContact}
                keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.button, !contact && styles.buttonDisabled]}
              onPress={() => {
                void handleSendOTP();
              }}
              disabled={!contact || isRequestingOtp}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{isRequestingOtp ? 'Sending...' : 'Send Code'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpInputs.current[index] = ref;
                  }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="number-pad"
                  // Not 1: a maxLength of 1 makes the native input drop every
                  // character but the first when a code is pasted.
                  maxLength={OTP_LENGTH}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, otp.join('').length !== 6 && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={otp.join('').length !== 6 || isVerifyingOtp}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{isVerifyingOtp ? 'Verifying...' : 'Verify'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                void handleSendOTP();
              }}
              style={styles.resendButton}
            >
              <Text style={styles.resendText}>Didn't receive code? <Text style={styles.resendTextBold}>Resend</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.changeButton}>
              <Text style={styles.changeText}>Change {method}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.small,
    marginBottom: 24,
    width: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.grayLight,
    textAlign: 'center',
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  otpInputFilled: {
    backgroundColor: COLORS.grayLight,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: SIZES.radiusLarge,
    width: '100%',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grayLight,
  },
  buttonText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  resendButton: {
    marginTop: 24,
  },
  resendText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  resendTextBold: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  changeButton: {
    marginTop: 16,
  },
  changeText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});
