import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OTPVerificationScreen({ navigation, route }) {
  const { method } = route.params; // 'email' or 'phone'
  const [contact, setContact] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef([]);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^\d{10,}$/.test(phone.replace(/[\s-]/g, ''));
  };

  const handleSendOTP = async () => {
    if (method === 'email' && !isValidEmail(contact)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    if (method === 'phone' && !isValidPhone(contact)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    // TODO: Implement actual OTP sending API call
    // For now, simulate sending OTP
    setOtpSent(true);
    Alert.alert('OTP Sent', `A verification code has been sent to your ${method}`);
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code');
      return;
    }

    // TODO: Implement actual OTP verification API call
    // For now, simulate verification
    try {
      // Store the contact method and value
      await AsyncStorage.setItem('authMethod', method);
      if (method === 'email') {
        await AsyncStorage.setItem('userEmail', contact);
      } else {
        await AsyncStorage.setItem('userPhone', contact);
      }
      
      // Check if user is new or returning
      const hasProfile = await AsyncStorage.getItem('hasProfile');
      
      if (!hasProfile) {
        // New user - go to segment selection
        navigation.navigate('SegmentSelection');
      } else {
        // Returning user - log them in
        await AsyncStorage.setItem('userToken', 'verified-token');
        navigation.navigate('Welcome'); // This will trigger app reload to Main
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
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
              onPress={handleSendOTP}
              disabled={!contact}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Send Code</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpInputs.current[index] = ref)}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, otp.join('').length !== 6 && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={otp.join('').length !== 6}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSendOTP} style={styles.resendButton}>
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
    backgroundColor: COLORS.primaryLight,
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
    borderRadius: SIZES.radiusMedium,
    paddingHorizontal: SIZES.paddingSmall,
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
    borderRadius: SIZES.radiusMedium,
    backgroundColor: COLORS.grayLight,
    textAlign: 'center',
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  otpInputFilled: {
    backgroundColor: COLORS.primaryLight,
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
