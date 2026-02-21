import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList, Match } from '../types';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'ProfileView'>;

export default function ProfileViewScreen({ navigation, route }: Props) {
  const { user } = route.params;
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [coinBalance, setCoinBalance] = useState(100); // Mock balance
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    setActivePhotoIndex(index);
  };

  const handleStartChat = () => {
    setShowCoinModal(true);
  };

  const confirmUnlock = () => {
    if (coinBalance >= 15) {
      setCoinBalance(prev => prev - 15);
      setShowCoinModal(false);
      
      const matchData: Match = {
        id: user.id,
        name: user.name,
        age: user.age,
        photo: user.photos[0],
        timestamp: new Date().toISOString(),
      };
      
      navigation.navigate('Chat', { match: matchData });
    } else {
      Alert.alert(
        "Insufficient Coins", 
        "Please top up to start a conversation.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Top Up", onPress: () => navigation.navigate('GetCoins' as never) }
        ]
      );
      setShowCoinModal(false);
    }
  };

  const CoinModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showCoinModal}
      onRequestClose={() => setShowCoinModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.coinIconContainer}>
            <Ionicons name="chatbubbles" size={32} color="#FFD700" />
          </View>
          <Text style={styles.modalTitle}>Start Conversation?</Text>
          <Text style={styles.modalText}>
            Unlock chat with <Text style={styles.highlightText}>{user.name}</Text> for <Text style={styles.coinText}>15 Coins</Text>.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowCoinModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={confirmUnlock}
            >
              <Text style={styles.confirmButtonText}>Unlock (15 💰)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const FullImageModal = () => (
    <Modal
      visible={showFullImage}
      transparent={false}
      animationType="fade"
      onRequestClose={() => setShowFullImage(false)}
    >
      <View style={styles.fullImageContainer}>
        <StatusBar hidden />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowFullImage(false)}
        >
          <Ionicons name="close" size={30} color={COLORS.white} />
        </TouchableOpacity>
        
        <Image
          source={{ uri: user.photos[activePhotoIndex] }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <FullImageModal />
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const slide = Math.ceil(
                nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width
              );
              if (slide !== activePhotoIndex) {
                setActivePhotoIndex(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {user.photos && user.photos.length > 0 ? (
              user.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPress={() => setShowFullImage(true)}
                >
                  <Image
                    source={{ uri: photo }}
                    style={[styles.image, { width: width }]}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Image
                source={{ uri: 'https://via.placeholder.com/400' }}
                style={[styles.image, { width: width }]}
              />
            )}
          </ScrollView>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          />
          
          {/* Navigation Hints (Arrows) */}
          {activePhotoIndex > 0 && (
            <TouchableOpacity 
              style={[styles.navArrowContainer, styles.navArrowLeft]}
              onPress={() => scrollToIndex(activePhotoIndex - 1)}
            >
              <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}

          {user.photos && activePhotoIndex < user.photos.length - 1 && (
            <TouchableOpacity 
              style={[styles.navArrowContainer, styles.navArrowRight]}
              onPress={() => scrollToIndex(activePhotoIndex + 1)}
            >
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
          
          {/* Pagination Dots */}
          {user.photos && user.photos.length > 1 && (
            <View style={styles.paginationContainer}>
              {user.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activePhotoIndex
                      ? styles.paginationDotActive
                      : styles.paginationDotInactive,
                  ]}
                />
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerInfo}>
            <View>
              <Text style={styles.name}>{user.name}, {user.age}</Text>
              <Text style={styles.location}>
                <Ionicons name="location-sharp" size={16} color={COLORS.textSecondary} /> New York, USA
              </Text>
            </View>
            <View style={styles.segmentBadge}>
              <Text style={[styles.segmentText, { color: user.segment === 'relationship' ? COLORS.primary : COLORS.fun }]}>
                {user.segment === 'relationship' ? 'Relationship' : 'Fun'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {['Travel', 'Coffee', 'Music', 'Photography'].map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your Balance:</Text>
          <Text style={styles.balanceValue}>{coinBalance} 💰</Text>
        </View>

        <TouchableOpacity style={styles.waveButton}>
          <Ionicons name="hand-right-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.chatButton}
          onPress={handleStartChat}
        >
          <Text style={styles.chatButtonText}>Message (15 💰)</Text>
          <Ionicons name="send" size={18} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      <CoinModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    height: 450,
    width: '100%',
    position: 'relative',
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 12,
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  navArrowContainer: {
    position: 'absolute',
    top: '50%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -16, // Center vertically
  },
  navArrowLeft: {
    left: 10,
  },
  navArrowRight: {
    right: 10,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 20,
    marginTop: -30,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 500,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
  segmentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
  },
  segmentText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  interestText: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  balanceContainer: {
    marginRight: 15,
  },
  balanceLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  balanceValue: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  waveButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chatButton: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  chatButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  coinIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  highlightText: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  coinText: {
    color: '#D4AF37',
    fontFamily: FONTS.bold,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  fullImageContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
});
