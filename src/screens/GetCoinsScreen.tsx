import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'GetCoins'>;

const COIN_PACKAGES = [
  { id: '1', coins: 100, price: '$4.99', popular: false },
  { id: '2', coins: 500, price: '$19.99', popular: true },
  { id: '3', coins: 1000, price: '$34.99', popular: false },
  { id: '4', coins: 5000, price: '$99.99', popular: false },
];

export default function GetCoinsScreen({ navigation }: Props) {
  // Mock function for purchase
  const handlePurchase = (pkg: typeof COIN_PACKAGES[0]) => {
    Alert.alert(
      "Confirm Purchase",
      `Buy ${pkg.coins} coins for ${pkg.price}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Buy", 
          onPress: () => {
             // Here you would integrate In-App Purchases
             Alert.alert("Success", `You purchased ${pkg.coins} coins!`);
             navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        {navigation.canGoBack() && navigation.getState().type === 'stack' ? (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.headerTitle}>Get Coins</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <View style={styles.coinRow}>
            <Ionicons name="chatbubbles" size={32} color="#FFD700" />
            <Text style={styles.balanceText}>100 Coins</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select a Package</Text>

        <View style={styles.packagesContainer}>
          {COIN_PACKAGES.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.packageCard, pkg.popular && styles.popularCard]}
              onPress={() => handlePurchase(pkg)}
              activeOpacity={0.9}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Best Value</Text>
                </View>
              )}
              
              <View style={styles.coinIconWrapper}>
                 <Ionicons name="chatbubbles" size={28} color="#FFD700" />
              </View>
              
              <Text style={styles.coinAmount}>{pkg.coins} Coins</Text>
              
              <View style={styles.priceButton}>
                <Text style={styles.priceText}>{pkg.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoContainer}>
           <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
           <Text style={styles.infoText}>
             Coins are used to unlock chats and join dates. Purchases are minimal and secure.
           </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SIZES.padding,
  },
  balanceContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    ...SHADOWS.medium,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  packagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  packageCard: {
    width: '47%', // 2 columns
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...SHADOWS.small,
    marginBottom: 16,
  },
  popularCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#FFF9F9',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  coinIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFAE6', // Light gold
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  coinAmount: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 16,
  },
  priceButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  priceText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
});
