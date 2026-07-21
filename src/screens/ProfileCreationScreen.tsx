import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../components';
import { completeProfile } from '../services/profile.service';

import { RootStackParamList } from '../types';
import { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<RootStackParamList, 'ProfileCreation'>;

export default function ProfileCreationScreen({ navigation, route }: Props) {
  const { segment } = route.params || {};
  const { showToast } = useToast();
  
  const [authMethod, setAuthMethod] = useState<string | null>('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [dobError, setDobError] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const genders = ['Male', 'Female'];

  useEffect(() => {
    loadAuthMethod();
  }, []);

  const loadAuthMethod = async () => {
    const method = await AsyncStorage.getItem('authMethod');
    setAuthMethod(method);
    
    // Pre-fill email or phone based on auth method
    if (method === 'email') {
      const userEmail = await AsyncStorage.getItem('userEmail');
      setEmail(userEmail || '');
    } else if (method === 'phone') {
      const userPhone = await AsyncStorage.getItem('userPhone');
      setPhone(userPhone || '');
    }
  };

  const calculateProgress = (): number => {
    let filled = 0;
    const totalFields = 6; // name, dob, gender, bio, email/phone
    if (name) filled++;
    if (dateOfBirth) filled++;
    if (gender !== '') filled++;
    if (bio) filled++;
    if (authMethod === 'email' && phone) filled++;
    if (authMethod === 'phone' && email) filled++;
    return Math.round((filled / totalFields) * 100);
  };

  const progress = calculateProgress();
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\d{10,}$/.test(phone.replace(/[\s-]/g, ''));
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Validate and construct date from DOB fields
  const validateAndSetDob = (day: string, month: string, year: string) => {
    setDobError('');
    
    // Only validate when all fields are filled
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      // Basic validation
      if (monthNum < 1 || monthNum > 12) {
        setDobError('Invalid month');
        setDateOfBirth(null);
        return;
      }
      
      // Days in month validation
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
      if (dayNum < 1 || dayNum > daysInMonth) {
        setDobError('Invalid day for this month');
        setDateOfBirth(null);
        return;
      }
      
      // Year range validation
      const currentYear = new Date().getFullYear();
      if (yearNum < 1940 || yearNum > currentYear) {
        setDobError('Invalid year');
        setDateOfBirth(null);
        return;
      }
      
      // Create the date
      const date = new Date(yearNum, monthNum - 1, dayNum);
      
      // Check if date is in the future
      if (date > new Date()) {
        setDobError('Date cannot be in the future');
        setDateOfBirth(null);
        return;
      }
      
      // Age validation
      const age = calculateAge(date);
      if (age < 18) {
        setDobError('You must be at least 18 years old');
        setDateOfBirth(null);
        return;
      }
      
      setDateOfBirth(date);
    } else {
      setDateOfBirth(null);
    }
  };

  const handleDayChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setDobDay(cleaned);
    validateAndSetDob(cleaned, dobMonth, dobYear);
    
    // Auto-advance to month field
    if (cleaned.length === 2) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setDobMonth(cleaned);
    validateAndSetDob(dobDay, cleaned, dobYear);
    
    // Auto-advance to year field
    if (cleaned.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setDobYear(cleaned);
    validateAndSetDob(dobDay, dobMonth, cleaned);
  };

  const handleDayKeyPress = (e: any) => {
    // Handle backspace when field is empty - go to previous field
    if (e.nativeEvent.key === 'Backspace' && dobDay === '') {
      // Day is first field, do nothing
    }
  };

  const handleMonthKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Backspace' && dobMonth === '') {
      dayRef.current?.focus();
    }
  };

  const handleYearKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Backspace' && dobYear === '') {
      monthRef.current?.focus();
    }
  };

  const isDobComplete = dobDay.length === 2 && dobMonth.length === 2 && dobYear.length === 4 && dateOfBirth !== null;

  const isValid = () => {
    if (!name || !dateOfBirth || !gender) return false;
    if (authMethod === 'email' && (!phone || !isValidPhone(phone))) return false;
    if (authMethod === 'phone' && (!email || !isValidEmail(email))) return false;
    return true;
  };

  const handleContinue = async () => {
    if (!isValid()) {
      showToast({
        type: 'warning',
        title: 'Incomplete Profile',
        message: 'Please fill all required fields correctly',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const normalizedSegment = segment === 'fun' ? 'fun' : 'relationship';
      const payload: {
        fullName: string;
        dateOfBirth: string;
        gender: 'male' | 'female';
        bio?: string;
        segment: 'relationship' | 'fun';
        email?: string;
        phone?: string;
      } = {
        fullName: name.trim(),
        dateOfBirth: dateOfBirth!.toISOString(),
        gender: gender.toLowerCase() as 'male' | 'female',
        bio: bio.trim() || undefined,
        segment: normalizedSegment,
      };

      if (authMethod === 'email') {
        payload.phone = phone.trim();
        await AsyncStorage.setItem('userPhone', phone.trim());
      }

      if (authMethod === 'phone') {
        payload.email = email.trim().toLowerCase();
        await AsyncStorage.setItem('userEmail', email.trim().toLowerCase());
      }

      await completeProfile(payload);
      await AsyncStorage.setItem('userSegment', normalizedSegment);

      navigation.navigate('LocationPermission');
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
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
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Let's set up your profile to help you find the perfect match
          </Text>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
              />
              {name && <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />}
            </View>
          </View>

          {/* Date of Birth Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
            <View style={styles.dobContainer}>
              <View style={[styles.dobFieldContainer, dobDay && styles.dobFieldFilled, dobError && dobDay.length === 2 && styles.dobFieldError]}>
                <TextInput
                  ref={dayRef}
                  style={styles.dobInput}
                  placeholder="DD"
                  placeholderTextColor={COLORS.textLight}
                  value={dobDay}
                  onChangeText={handleDayChange}
                  onKeyPress={handleDayKeyPress}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>
              <Text style={styles.dobSeparator}>/</Text>
              <View style={[styles.dobFieldContainer, dobMonth && styles.dobFieldFilled, dobError && dobMonth.length === 2 && styles.dobFieldError]}>
                <TextInput
                  ref={monthRef}
                  style={styles.dobInput}
                  placeholder="MM"
                  placeholderTextColor={COLORS.textLight}
                  value={dobMonth}
                  onChangeText={handleMonthChange}
                  onKeyPress={handleMonthKeyPress}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>
              <Text style={styles.dobSeparator}>/</Text>
              <View style={[styles.dobFieldContainer, styles.dobYearField, dobYear && styles.dobFieldFilled, dobError && dobYear.length === 4 && styles.dobFieldError]}>
                <TextInput
                  ref={yearRef}
                  style={styles.dobInput}
                  placeholder="YYYY"
                  placeholderTextColor={COLORS.textLight}
                  value={dobYear}
                  onChangeText={handleYearChange}
                  onKeyPress={handleYearKeyPress}
                  keyboardType="number-pad"
                  maxLength={4}
                  selectTextOnFocus
                />
              </View>
              {isDobComplete && (
                <View style={styles.dobCheckContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
              )}
            </View>
            {dobError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.primary} />
                <Text style={styles.errorText}>{dobError}</Text>
              </View>
            ) : (
              <View style={styles.warningContainer}>
                <Ionicons name="warning-outline" size={16} color="#B45309" />
                <Text style={styles.warningText}>
                  Your date of birth can only be set once and cannot be changed later
                </Text>
              </View>
            )}
          </View>

          {/* Gender Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.genderContainer}>
              {genders.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.genderButton,
                    gender === item && styles.genderButtonSelected,
                  ]}
                  onPress={() => setGender(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item === 'Male' ? 'male' : item === 'Female' ? 'female' : 'male-female'}
                    size={24}
                    color={gender === item ? COLORS.white : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.genderText,
                      gender === item && styles.genderTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {gender === item && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.white}
                      style={styles.genderCheck}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Email/Phone Input based on auth method */}
          {authMethod === 'phone' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {email && isValidEmail(email) && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                )}
              </View>
            </View>
          )}

          {authMethod === 'email' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+1234567890"
                  placeholderTextColor={COLORS.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                {phone && isValidPhone(phone) && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                )}
              </View>
            </View>
          )}

          {/* Bio Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              About You{' '}
              <Text style={styles.optionalText}>(Optional)</Text>
            </Text>
            <View style={[styles.inputContainer, styles.bioContainer]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Write something interesting about yourself..."
                placeholderTextColor={COLORS.textLight}
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={150}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Profile Tips:</Text>
              <Text style={styles.tipText}>• Use your real name to build trust</Text>
              <Text style={styles.tipText}>• Enter accurate date of birth</Text>
              <Text style={styles.tipText}>• Make your bio fun and authentic</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, (!isValid() || isSubmitting) && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!isValid() || isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{isSubmitting ? 'Saving...' : 'Continue'}</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Off-white
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.small,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray, // Darker gray
    borderRadius: 3,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 40,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 12,
  },
  optionalText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white, // White input
    borderRadius: SIZES.radius,
    paddingHorizontal: 20,
    height: 60,
    borderWidth: 1,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  inputIcon: {
    marginRight: 16,
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  bioContainer: {
    height: 140,
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  bioInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white, // White card
    borderRadius: SIZES.radius,
    paddingVertical: 24, // Taller touch target
    gap: 12,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  genderText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  genderTextSelected: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 94, 98, 0.1)', // Subtle primary tint (coral)
    borderRadius: SIZES.radius,
    padding: 20,
    gap: 16,
    marginTop: 16,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: COLORS.background,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLarge, // Pill
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...SHADOWS.medium,
    shadowColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
    shadowOpacity: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  // DOB Input Styles
  dobContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dobFieldContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
    width: 60,
  },
  dobYearField: {
    width: 80,
  },
  dobFieldFilled: {
    borderColor: COLORS.primary + '30',
  },
  dobFieldError: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  dobInput: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  dobSeparator: {
    fontSize: 24,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  dobCheckContainer: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    lineHeight: 18,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#B45309', 
    lineHeight: 18,
  },
  genderCheck: {
    marginLeft: 8,
  },
});
