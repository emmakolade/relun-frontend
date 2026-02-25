import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../types';
import { StackScreenProps } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'SegmentSelection'>;

export default function SegmentSelectionScreen({ navigation }: Props) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const segments = [
    {
      id: 'relationship',
      title: '💍 Relationship',
      description: 'Looking for something serious and long-term',
      icon: 'heart',
      gradient: [COLORS.gradientStart, COLORS.gradientEnd] as const,
    },
    {
      id: 'fun',
      title: '🎉 Fun',
      description: 'Casual, flirty, and keeping it light',
      icon: 'sparkles',
      gradient: ['#FF9F1C', '#FF7028'] as const,
    },
  ];

  const handleContinue = async () => {
    if (selectedSegment) {
      await AsyncStorage.setItem('userSegment', selectedSegment);
      navigation.navigate('ProfileCreation', { segment: selectedSegment });
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
          <View style={[styles.progress, { width: '25%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>What are you looking for?</Text>
        <Text style={styles.subtitle}>
          Choose your relationship intention. You'll only see people with the same goal.
        </Text>

        {/* Segment Cards */}
        <View style={styles.segmentsContainer}>
          {segments.map((segment) => (
            <TouchableOpacity
              key={segment.id}
              activeOpacity={0.8}
              onPress={() => setSelectedSegment(segment.id)}
              style={styles.cardWrapper}
            >
              <LinearGradient
                colors={segment.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.segmentCard,
                  selectedSegment === segment.id && styles.selectedCard,
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.segmentTitle}>{segment.title}</Text>
                    <Text style={styles.segmentDescription}>{segment.description}</Text>
                  </View>
                  <View style={styles.checkContainer}>
                    {selectedSegment === segment.id ? (
                      <View style={styles.checkedCircle}>
                        <Ionicons name="checkmark" size={18} color={COLORS.white} />
                      </View>
                    ) : (
                      <View style={styles.uncheckedCircle} />
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Your segment choice ensures you only match with people who share your intentions
          </Text>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedSegment && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedSegment}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
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
    backgroundColor: COLORS.gray, // Darker gray for better contrast on off-white
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
    marginBottom: 32,
    lineHeight: 22,
  },
  segmentsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  segmentCard: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    ...SHADOWS.medium,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...SHADOWS.large,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    marginRight: 16,
  },
  checkContainer: {
    width: 28,
    height: 28,
  },
  checkedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  uncheckedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  segmentTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  segmentDescription: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.white, // White card on off-white bg
    borderRadius: SIZES.radius,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
    ...SHADOWS.small,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLarge, // Pill shape
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.medium,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
    shadowOpacity: 0,
  },
  continueButtonText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});
