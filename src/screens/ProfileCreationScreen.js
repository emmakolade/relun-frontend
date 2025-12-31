import React, { useState } from 'react';
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

export default function ProfileCreationScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');

  const genders = ['Male', 'Female'];

  const calculateProgress = () => {
    let filled = 0;
    if (name) filled += 25;
    if (age) filled += 25;
    if (gender) filled += 25;
    if (bio) filled += 25;
    return filled;
  };

  const progress = calculateProgress();
  const isValid = name && age && gender;

  const handleContinue = async () => {
    if (isValid) {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userAge', age);
      await AsyncStorage.setItem('userGender', gender);
      await AsyncStorage.setItem('userBio', bio);
      navigation.navigate('PhotoUpload');
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
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us about yourself to find your perfect match
          </Text>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>What's your name?</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
              />
              {name && <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />}
            </View>
          </View>

          {/* Age Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>How old are you?</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                placeholderTextColor={COLORS.textLight}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={2}
              />
              {age && <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />}
            </View>
          </View>

          {/* Gender Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select your gender</Text>
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
                    name={item === 'Male' ? 'male' : 'female'}
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

          {/* Bio Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Tell us about yourself{' '}
              <Text style={styles.optionalText}>(Optional)</Text>
            </Text>
            <View style={[styles.inputContainer, styles.bioContainer]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Write a short bio to stand out..."
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
              <Text style={styles.tipText}>• Be honest about your age</Text>
              <Text style={styles.tipText}>• Make your bio fun and authentic</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !isValid && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!isValid}
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
