import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList, User } from '../types';
import { useToast } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDiscoverUsers, likeUser } from '../services/profile.service';

const { width } = Dimensions.get('window');
const TILE_GAP = 8;
const TILE_WIDTH = (width - 40 - TILE_GAP * 2) / 3; // 3 columns with padding

type FeedScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function FeedScreen() {
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const loadDiscoverUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const locationRaw = await AsyncStorage.getItem('userLocation');
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (locationRaw) {
        try {
          const parsed = JSON.parse(locationRaw) as {
            coords?: { latitude?: number; longitude?: number };
          };

          latitude = parsed.coords?.latitude;
          longitude = parsed.coords?.longitude;
        } catch (_error) {
          // Ignore malformed local cache and fallback to non-location discover.
        }
      }

      const responseUsers = await getDiscoverUsers({
        latitude,
        longitude,
        limit: 50,
      });

      setUsers(responseUsers);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Discover unavailable',
        message: error instanceof Error ? error.message : 'Failed to load profiles.',
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadDiscoverUsers();
  }, [loadDiscoverUsers]);

  const handleLike = async (userId: string, userName: string) => {
    if (likedUsers.includes(userId)) return;

    try {
      const response = await likeUser(userId);
      setLikedUsers((prev) => [...prev, userId]);

      if (response.isMutual) {
        showToast({
          type: 'success',
          title: "It's a match!",
          message: `You and ${userName} liked each other.`,
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'Liked',
        message: `You liked ${userName}.`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Unable to like user',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

  // List View Card
  const renderListItem = ({ item }: { item: User }) => {
    const isLiked = likedUsers.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProfileView', { user: item })}
        style={styles.cardContainer}
      >
        <Image source={{ uri: item.photos[0] }} style={styles.cardImage} />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>
                {item.name}, {item.age}
              </Text>
              <Text style={styles.bioText} numberOfLines={1}>
                {item.bio}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.waveButton,
                isLiked && styles.waveButtonActive
              ]}
              onPress={(e) => {
                e.stopPropagation();
                void handleLike(item.id, item.name);
              }}
              disabled={isLiked}
            >
              <Ionicons 
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24} 
                color={isLiked ? COLORS.white : COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={[
          styles.segmentBadge, 
          { backgroundColor: item.segment === 'relationship' ? COLORS.primary : COLORS.fun }
        ]}>
          <Text style={styles.segmentText}>
            {item.segment === 'relationship' ? 'Relationship' : 'Fun'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Grid/Tile View Card
  const renderGridItem = ({ item }: { item: User }) => {
    const isLiked = likedUsers.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProfileView', { user: item })}
        style={styles.tileContainer}
      >
        <Image source={{ uri: item.photos[0] }} style={styles.tileImage} />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.tileGradient}
        >
          <Text style={styles.tileName}>{item.name}, {item.age}</Text>
          
          <TouchableOpacity
            style={[
              styles.tileWaveButton,
              isLiked && styles.tileWaveButtonActive
            ]}
            onPress={(e) => {
              e.stopPropagation();
              void handleLike(item.id, item.name);
            }}
            disabled={isLiked}
          >
            <Ionicons 
              name={isLiked ? 'heart' : 'heart-outline'}
              size={14} 
              color={isLiked ? COLORS.white : COLORS.primary} 
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Online indicator */}
        <View style={styles.onlineIndicator} />
        
        {/* Segment dot */}
        <View style={[
          styles.tileSegmentDot,
          { backgroundColor: item.segment === 'relationship' ? COLORS.primary : COLORS.fun }
        ]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>Discover</Text>
        
        <View style={styles.headerRight}>
          {/* View Toggle */}
          <TouchableOpacity 
            style={styles.viewToggle}
            onPress={toggleViewMode}
          >
            <Ionicons 
              name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} 
              size={22} 
              color={COLORS.text} 
            />
          </TouchableOpacity>

          {/* Coin Balance */}
          <View style={styles.coinBalance}>
            <Ionicons name="stop-circle" size={18} color="#FFD700" />
            <Text style={styles.coinText}>100</Text>
          </View>
        </View>
      </SafeAreaView>

      {viewMode === 'list' ? (
        <FlatList
          key="list"
          data={users}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          refreshing={isLoading}
          onRefresh={() => {
            void loadDiscoverUsers();
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No profiles found yet.</Text>}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          key="grid"
          data={users}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.gridRow}
          refreshing={isLoading}
          onRefresh={() => {
            void loadDiscoverUsers();
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No profiles found yet.</Text>}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  coinText: {
    marginLeft: 6,
    fontFamily: FONTS.semiBold,
    color: '#D4AF37',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 24,
  },
  
  // List View Styles
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    height: 400,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: 15,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  nameText: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  bioText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  waveButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  waveButtonActive: {
    backgroundColor: COLORS.primary,
  },
  segmentBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  segmentText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },

  // Grid/Tile View Styles
  gridContent: {
    padding: 20,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: TILE_GAP,
  },
  tileContainer: {
    width: TILE_WIDTH,
    height: TILE_WIDTH * 1.35,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  tileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tileGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 8,
    paddingBottom: 10,
  },
  tileName: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
    marginRight: 28,
  },
  tileWaveButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  tileWaveButtonActive: {
    backgroundColor: COLORS.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  tileSegmentDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
});
