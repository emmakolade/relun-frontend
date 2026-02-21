import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');
const TILE_GAP = 12;
const TILE_WIDTH = (width - 40 - TILE_GAP) / 2; // 2 columns with padding

// Extended Mock Data
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    bio: 'Love traveling, coffee enthusiast ☕️',
    photos: [
      'https://randomuser.me/api/portraits/women/1.jpg',
      'https://randomuser.me/api/portraits/women/68.jpg',
      'https://randomuser.me/api/portraits/women/65.jpg'
    ],
    segment: 'relationship',
  },
  {
    id: '2',
    name: 'Emma',
    age: 26,
    bio: 'Yoga instructor 🧘‍♀️ | Dog lover 🐕',
    photos: [
      'https://randomuser.me/api/portraits/women/2.jpg',
      'https://randomuser.me/api/portraits/women/42.jpg'
    ],
    segment: 'relationship',
  },
  {
    id: '3',
    name: 'Jessica',
    age: 29,
    bio: 'Foodie 🍕 | Adventure seeker 🏔️',
    photos: ['https://randomuser.me/api/portraits/women/3.jpg'],
    segment: 'fun',
  },
  {
    id: '4',
    name: 'Michael',
    age: 30,
    bio: 'Photographer 📷 | Hiker',
    photos: ['https://randomuser.me/api/portraits/men/4.jpg'],
    segment: 'relationship',
  },
  {
    id: '5',
    name: 'David',
    age: 27,
    bio: 'Software Engineer 💻 | Gamer',
    photos: ['https://randomuser.me/api/portraits/men/5.jpg'],
    segment: 'fun',
  },
  {
    id: '6',
    name: 'Olivia',
    age: 25,
    bio: 'Music lover 🎵 | Coffee addict',
    photos: ['https://randomuser.me/api/portraits/women/6.jpg'],
    segment: 'relationship',
  },
  {
    id: '7',
    name: 'James',
    age: 31,
    bio: 'Traveler ✈️ | Foodie',
    photos: ['https://randomuser.me/api/portraits/men/7.jpg'],
    segment: 'fun',
  },
  {
    id: '8',
    name: 'Sophia',
    age: 24,
    bio: 'Artist 🎨 | Book worm',
    photos: ['https://randomuser.me/api/portraits/women/8.jpg'],
    segment: 'relationship',
  },
];

type FeedScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function FeedScreen() {
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [wavedUsers, setWavedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const handleWave = (userId: string) => {
    if (wavedUsers.includes(userId)) return;
    setWavedUsers([...wavedUsers, userId]);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

  // List View Card
  const renderListItem = ({ item }: { item: User }) => {
    const isWaved = wavedUsers.includes(item.id);

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
                isWaved && styles.waveButtonActive
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleWave(item.id);
              }}
              disabled={isWaved}
            >
              <Ionicons 
                name={isWaved ? "hand-right" : "hand-right-outline"} 
                size={24} 
                color={isWaved ? COLORS.white : COLORS.primary} 
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
    const isWaved = wavedUsers.includes(item.id);

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
              isWaved && styles.tileWaveButtonActive
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleWave(item.id);
            }}
            disabled={isWaved}
          >
            <Ionicons 
              name={isWaved ? "hand-right" : "hand-right-outline"} 
              size={18} 
              color={isWaved ? COLORS.white : COLORS.primary} 
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          key="grid"
          data={users}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
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
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 12,
    paddingBottom: 14,
  },
  tileName: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
    marginRight: 40,
  },
  tileWaveButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
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
    top: 10,
    left: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  tileSegmentDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
