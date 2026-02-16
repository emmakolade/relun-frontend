import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../constants/theme';
import { MainTabParamList } from '../types';

// Screens
import SwipeScreen from '../screens/SwipeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // Modern cleaner look
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          position: 'absolute', // Floating effect
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 20,
          right: 20,
          backgroundColor: COLORS.white,
          borderRadius: 32,
          height: 64,
          borderTopWidth: 0,
          elevation: 8, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          paddingBottom: 0, // Reset default padding
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarItemStyle: {
          height: 64,
          padding: 0,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Swipe') {
            iconName = focused ? 'heart' : 'heart-outline'; // Changed to Heart for dating context
          } else if (route.name === 'Matches') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Active indicator (dot or specialized styling) could go here
          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              top: Platform.OS === 'ios' ? 12 : 0, // Center vertically
            }}>
              <Ionicons 
                name={iconName} 
                size={28} // Slightly larger icons
                color={color} 
              />
              {focused && (
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.primary,
                  marginTop: 4,
                }} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Swipe" component={SwipeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
