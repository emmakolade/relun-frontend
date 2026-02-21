import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'GetCoins'>;

// Currency configurations based on country
const CURRENCY_CONFIG: { [key: string]: { symbol: string; code: string; rate: number } } = {
  NG: { symbol: '₦', code: 'NGN', rate: 1600 },    // Nigeria - Naira
  US: { symbol: '$', code: 'USD', rate: 1 },       // United States - Dollar
  GB: { symbol: '£', code: 'GBP', rate: 0.79 },    // United Kingdom - Pound
  EU: { symbol: '€', code: 'EUR', rate: 0.92 },    // European Union - Euro
  GH: { symbol: '₵', code: 'GHS', rate: 15.5 },    // Ghana - Cedi
  KE: { symbol: 'KSh', code: 'KES', rate: 153 },   // Kenya - Shilling
  ZA: { symbol: 'R', code: 'ZAR', rate: 18.5 },    // South Africa - Rand
  IN: { symbol: '₹', code: 'INR', rate: 83 },      // India - Rupee
  CA: { symbol: 'C$', code: 'CAD', rate: 1.36 },   // Canada - Dollar
  AU: { symbol: 'A$', code: 'AUD', rate: 1.53 },   // Australia - Dollar
  DEFAULT: { symbol: '$', code: 'USD', rate: 1 },  // Default fallback
};

// EU country codes
const EU_COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR'];

// Base prices in USD
const BASE_PACKAGES = [
  { id: '1', coins: 100, basePrice: 4.99, popular: false },
  { id: '2', coins: 500, basePrice: 19.99, popular: true },
  { id: '3', coins: 1000, basePrice: 34.99, popular: false },
  { id: '4', coins: 5000, basePrice: 99.99, popular: false },
];

export default function GetCoinsScreen({ navigation }: Props) {
  const [currency, setCurrency] = useState(CURRENCY_CONFIG.DEFAULT);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied, using default currency');
        setCurrency(CURRENCY_CONFIG.DEFAULT);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address?.isoCountryCode) {
        const countryCode = address.isoCountryCode;
        
        // Check if it's an EU country
        if (EU_COUNTRIES.includes(countryCode)) {
          setCurrency(CURRENCY_CONFIG.EU);
        } else if (CURRENCY_CONFIG[countryCode]) {
          setCurrency(CURRENCY_CONFIG[countryCode]);
        } else {
          setCurrency(CURRENCY_CONFIG.DEFAULT);
        }
      }
    } catch (error) {
      console.log('Location detection failed:', error);
      setLocationError(true);
      setCurrency(CURRENCY_CONFIG.DEFAULT);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (basePrice: number): string => {
    const localPrice = basePrice * currency.rate;
    
    // Format based on currency
    if (currency.code === 'NGN') {
      return `${currency.symbol}${localPrice.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
    }
    return `${currency.symbol}${localPrice.toFixed(2)}`;
  };

  const handlePurchase = (pkg: typeof BASE_PACKAGES[0]) => {
    const price = formatPrice(pkg.basePrice);
    Alert.alert(
      "Confirm Purchase",
      `Buy ${pkg.coins} coins for ${price}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Buy", 
          onPress: () => {
             // Here you would integrate In-App Purchases
             Alert.alert("Success", `You purchased ${pkg.coins} coins!`);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Detecting your location...</Text>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.currencyNote}>Prices in {currency.code}</Text>
        </View>

        <Text style={styles.sectionTitle}>Select a Package</Text>

        <View style={styles.packagesContainer}>
          {BASE_PACKAGES.map((pkg) => (
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
                <Text style={styles.priceText}>{formatPrice(pkg.basePrice)}</Text>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
  currencyNote: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: FONTS.regular,
  },
});
