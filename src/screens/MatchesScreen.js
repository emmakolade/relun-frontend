import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import ChatScreen from './ChatScreen';

const Stack = createStackNavigator();


// Mock matches data
const MOCK_MATCHES = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    photo: 'https://randomuser.me/api/portraits/women/1.jpg',
    lastMessage: 'Hey! How are you?',
    timestamp: '2m ago',
    unread: true,
  },
  {
    id: '2',
    name: 'Emma',
    age: 26,
    photo: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: 'That sounds great!',
    timestamp: '1h ago',
    unread: false,
  },
  {
    id: '3',
    name: 'Jessica',
    age: 29,
    photo: 'https://randomuser.me/api/portraits/women/3.jpg',
    lastMessage: 'See you tomorrow 😊',
    timestamp: '3h ago',
    unread: false,
  },
];

function MatchesListScreen({ navigation }) {
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [activeTab, setActiveTab] = useState('matches');

  const renderMatch = ({ item }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('Chat', { match: item })}
      activeOpacity={0.7}
    >
      <View style={styles.matchImageContainer}>
        <Image source={{ uri: item.photo }} style={styles.matchImage} />
        {item.unread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>
            {item.name}, {item.age}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <Text style={[styles.lastMessage, item.unread && styles.unreadMessage]}>
          {item.lastMessage}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Matches
          </Text>
          {activeTab === 'matches' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
          onPress={() => setActiveTab('likes')}
        >
          <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
            Likes You
          </Text>
          {activeTab === 'likes' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Matches List */}
      {activeTab === 'matches' ? (
        matches.length > 0 ? (
          <FlatList
            data={matches}
            renderItem={renderMatch}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Matches Yet</Text>
            <Text style={styles.emptyText}>
              Start swiping to find your perfect match!
            </Text>
          </View>
        )
      ) : (
        // Likes You - Premium Feature
        <View style={styles.premiumContainer}>
          <View style={styles.premiumContent}>
            <View style={styles.premiumIcon}>
              <Ionicons name="star" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.premiumTitle}>See Who Likes You</Text>
            <Text style={styles.premiumText}>
              Upgrade to see who already swiped right on you
            </Text>
            <TouchableOpacity style={styles.premiumButton} activeOpacity={0.8}>
              <Ionicons name="star" size={20} color={COLORS.white} />
              <Text style={styles.premiumButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
            <Text style={styles.premiumNote}>
              Only available for Fun segment users
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function MatchesScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MatchesList" component={MatchesListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  matchImageContainer: {
    position: 'relative',
  },
  matchImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  timestamp: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  lastMessage: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  unreadMessage: {
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
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
  premiumContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  premiumContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  premiumIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: SIZES.radius,
    gap: 8,
    ...SHADOWS.medium,
  },
  premiumButtonText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  premiumNote: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: 16,
    textAlign: 'center',
  },
});
