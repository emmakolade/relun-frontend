import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList, Match } from '../types';
import { getMatches } from '../services/profile.service';
import { getConversations } from '../services/chat.service';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const formatRelativeTime = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

export default function MatchesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'likes'>('matches');

  const loadMatches = useCallback(async () => {
    try {
      // Matches come from the likes graph; conversations carry the preview and
      // unread count. A brand new match has no conversation yet.
      const [matchedUsers, conversations] = await Promise.all([getMatches(), getConversations()]);

      const conversationByUserId = new Map(
        conversations.map((conversation) => [conversation.otherUserId, conversation])
      );

      const merged = matchedUsers.map<Match>((user) => {
        const conversation = conversationByUserId.get(user.id);

        return {
          id: user.id,
          name: user.name,
          age: user.age,
          photo: user.photos[0] || '',
          lastMessage: conversation?.lastMessage?.content || 'You matched. Say hello!',
          timestamp: conversation?.lastMessage
            ? formatRelativeTime(conversation.lastMessage.createdAt)
            : '',
          unread: (conversation?.unreadCount ?? 0) > 0,
        };
      });

      // Most recent conversation first. ISO timestamps sort lexicographically,
      // and matches with no messages have '' so they fall to the bottom.
      merged.sort((a, b) => {
        const aTime = conversationByUserId.get(a.id)?.lastMessage?.createdAt || '';
        const bTime = conversationByUserId.get(b.id)?.lastMessage?.createdAt || '';
        return bTime.localeCompare(aTime);
      });

      setMatches(merged);
      setLoadError('');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load matches.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Refetch on focus so unread counts settle after leaving a chat.
  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMatches();
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('Chat', { match: item })}
      activeOpacity={0.7}
    >
      <View style={styles.matchImageContainer}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.matchImage} />
        ) : (
          <View style={[styles.matchImage, styles.matchImagePlaceholder]}>
            <Ionicons name="person" size={28} color={COLORS.textLight} />
          </View>
        )}
        {item.unread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>
            {item.name}, {item.age}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <Text style={[styles.lastMessage, item.unread && styles.unreadMessage]} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  const renderMatchesTab = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Could not load matches</Text>
          <Text style={styles.emptyText}>{loadError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (matches.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Matches Yet</Text>
          <Text style={styles.emptyText}>
            Start a conversation to see your messages here!
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    );
  };

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
        renderMatchesTab()
      ) : (
        // Likes You - Premium Feature
        <View style={styles.premiumContainer}>
          <View style={styles.premiumContent}>
             <View style={styles.premiumIcon}>
               <Ionicons name="heart" size={60} color={COLORS.primary} />
             </View>
             <Text style={styles.premiumTitle}>See Who Waves at You</Text>
             <Text style={styles.premiumText}>
               See people who are interested in you.
             </Text>
             <TouchableOpacity style={styles.premiumButton} activeOpacity={0.8}>
               <Ionicons name="star" size={20} color={COLORS.white} />
               <Text style={styles.premiumButtonText}>Get Coins</Text>
             </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
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
  matchImagePlaceholder: {
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
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
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
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
