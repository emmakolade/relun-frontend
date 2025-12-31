import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Mock data - in a real app, this would come from your backend
const MOCK_USERS = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    bio: 'Love traveling, coffee enthusiast ☕️',
    photos: ['https://randomuser.me/api/portraits/women/1.jpg'],
    segment: 'relationship',
  },
  {
    id: '2',
    name: 'Emma',
    age: 26,
    bio: 'Yoga instructor 🧘‍♀️ | Dog lover 🐕',
    photos: ['https://randomuser.me/api/portraits/women/2.jpg'],
    segment: 'relationship',
  },
  {
    id: '3',
    name: 'Jessica',
    age: 29,
    bio: 'Foodie 🍕 | Adventure seeker 🏔️',
    photos: ['https://randomuser.me/api/portraits/women/3.jpg'],
    segment: 'relationship',
  },
];

export default function SwipeScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState(MOCK_USERS);

  const currentUser = users[currentIndex];

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      console.log('Liked:', currentUser.name);
      // TODO: Send like to backend
      // If it's a match, show match modal
    } else {
      console.log('Passed:', currentUser.name);
      // TODO: Send pass to backend
    }

    // Move to next user
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more users
      setCurrentIndex(0); // Reset for demo
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-dislike-outline" size={80} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>No More Profiles</Text>
        <Text style={styles.emptyText}>
          Check back later for new matches in your area
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="heart" size={28} color={COLORS.white} />
            <Text style={styles.logoText}>relun</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Card */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image
            source={{ uri: currentUser.photos[0] }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>
                  {currentUser.name}, {currentUser.age}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
              </View>
              
              {currentUser.bio && (
                <View style={styles.bioContainer}>
                  <Text style={styles.bio}>{currentUser.bio}</Text>
                </View>
              )}

              <View style={styles.distanceContainer}>
                <Ionicons name="location" size={16} color={COLORS.white} />
                <Text style={styles.distance}>2 km away</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Info Button */}
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.nopeButton]}
          onPress={() => handleSwipe('left')}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={32} color={COLORS.nope} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superButton]}
          onPress={() => console.log('Super Like')}
          activeOpacity={0.8}
        >
          <Ionicons name="star" size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('right')}
          activeOpacity={0.8}
        >
          <Ionicons name="heart" size={32} color={COLORS.like} />
        </TouchableOpacity>
      </View>

      {/* Segment Indicator */}
      <View style={styles.segmentIndicator}>
        <View
          style={[
            styles.segmentBadge,
            {
              backgroundColor:
                currentUser.segment === 'relationship'
                  ? COLORS.relationship
                  : COLORS.fun,
            },
          ]}
        >
          <Text style={styles.segmentText}>
            {currentUser.segment === 'relationship' ? '💍 Relationship' : '🎉 Fun'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 28,
    fontFamily: FONTS.logo,
    color: COLORS.white,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  card: {
    width: width - 24,
    height: height * 0.7,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  cardInfo: {
    gap: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
  },
  bioContainer: {
    marginTop: 4,
  },
  bio: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.95,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  distance: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.9,
  },
  infoButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    gap: 20,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  nopeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  superButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  segmentIndicator: {
    position: 'absolute',
    top: 120,
    left: 32,
  },
  segmentBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  segmentText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
