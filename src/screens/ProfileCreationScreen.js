import React, { useState, useEffect } from 'react';
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
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileCreationScreen({ navigation, route }) {
  const { segment } = route.params || {};
  
  const [authMethod, setAuthMethod] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

  const calculateProgress = () => {
    let filled = 0;
    const totalFields = 6; // name, dob, gender, bio, email/phone
    if (name) filled++;
    if (dateOfBirth) filled++;
    if (gender) filled++;
    if (bio) filled++;
    if (authMethod === 'email' && phone) filled++;
    if (authMethod === 'phone' && email) filled++;
    return Math.round((filled / totalFields) * 100);
  };

  const progress = calculateProgress();
  
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^\d{10,}$/.test(phone.replace(/[\s-]/g, ''));
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const age = calculateAge(selectedDate);
      if (age < 18) {formatDate(dateOfBirth)
        Alert.alert('Age Requirement', 'You must be at least 18 years old to use this app.');
        return;
      }
      setDateOfBirth(selectedDate);
    }
  };

  const isValid = () => {
    if (!name || !dateOfBirth || !gender) return false;
    if (authMethod === 'email' && (!phone || !isValidPhone(phone))) return false;
    if (authMethod === 'phone' && (!email || !isValidEmail(email))) return false;
    return true;
  };

  const handleContinue = async () => {
    if (!isValid()) {
      Alert.alert('Incomplete Profile', 'Please fill all required fields correctly');
      return;
    }

    try {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userDateOfBirth', formatDate(dateOfBirth));
      await AsyncStorage.setItem('userGender', gender);
      await AsyncStorage.setItem('userBio', bio);
      await AsyncStorage.setItem('userSegment', segment || '');
      
      if (authMethod === 'email') {
        await AsyncStorage.setItem('userPhone', phone);
      } else {
        await AsyncStorage.setItem('userEmail', email);
      }
      
      navigation.navigate('PhotoUpload');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
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
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.dateText, !dateOfBirth && styles.placeholderText]}>
                {dateOfBirth ? formatDate(dateOfBirth) : 'Select your date of birth'}
              </Text>
              {dateOfBirth && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              )}
            </TouchableOpacity>
            <View style={styles.warningContainer}>
              <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
              <Text style={styles.warningText}>
                Your date of birth can only be set once and cannot be changed later
              </Text>
            </View>
          </View>

          {/* Date Picker Modal for iOS */}
          {Platform.OS === 'ios' && (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.modalCancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Date of Birth</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.modalDoneButton}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={dateOfBirth || new Date(2000, 0, 1)}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1940, 0, 1)}
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* Date Picker for Android */}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date(2000, 0, 1)}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1940, 0, 1)}
            />
          )}

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
          style={[styles.continueButton, !isValid() && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!isValid()}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue to Photos</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  dateText: {
    flex: 1,
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.warning,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  modalTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  modalCancelButton: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  modalDoneButton: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 12,
  },
  optionalText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  bioContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  bioInput: {
    height: '100%',
  },
  charCount: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZES.radius,
    paddingVertical: 20,
    gap: 8,
    position: 'relative',
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  genderText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  genderTextSelected: {
    color: COLORS.white,
  },
  genderCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: SIZES.radius,
    padding: 16,
    gap: 12,
    marginTop: 8,
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
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  continueButton: {
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
  continueButtonText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});
