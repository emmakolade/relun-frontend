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
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { MainTabParamList, RootStackParamList, User } from '../types';

const { width } = Dimensions.get('window');

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
];

type FeedScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function FeedScreen() {
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [wavedUsers, setWavedUsers] = useState<string[]>([]);

  const handleWave = (userId: string) => {
    if (wavedUsers.includes(userId)) return;
    
    // Logic to deduct coins or just notify user
    // For now, just mark locally as waved
    setWavedUsers([...wavedUsers, userId]);
    // Ideally user pays 2-5 coins here: "Ping" / "Wave" -> 2–5 coins
  };

  const renderItem = ({ item }: { item: User }) => {
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
              onPress={() => handleWave(item.id)}
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.coinBalance}>
          <Ionicons name="stop-circle" size={18} color="#FFD700" />
          <Text style={styles.coinText}>100</Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    justifyToShow: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
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
    color: '#D4AF37', // Gold color
    fontSize: 14,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // Space for tab bar
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
});
