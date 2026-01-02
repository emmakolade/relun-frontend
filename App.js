/**
 * Main App component for the Relun application.
 * 
 * @module App
 * 
 * @description
 * This is the root component that handles navigation and authentication flow.
 * 
 * @imports
 * - `React` - Core React library (unused in current implementation, can be removed in React 17+)
 * - `useEffect` - React hook for handling side effects like checking login status on mount
 * - `useState` - React hook for managing component state (login status, loading state)
 * - `NavigationContainer` - Wrapper component from React Navigation that manages navigation tree
 * - `createStackNavigator` - Creates a stack-based navigation pattern for screen transitions
 * - `AsyncStorage` - Persistent key-value storage for saving user authentication tokens
 * - `useFonts` - Expo hook for loading custom fonts asynchronously
 * - `Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold` - Poppins font family variants
 * - `Pacifico_400Regular` - Pacifico font family for decorative text
 * - `WelcomeScreen` - Initial screen shown to unauthenticated users
 * - `LoginScreen` - Screen for user authentication
 * - `SignupScreen` - Screen for new user registration
 * - `SegmentSelectionScreen` - Screen for selecting user segment/category
 * - `ProfileCreationScreen` - Screen for creating user profile information
 * - `PhotoUploadScreen` - Screen for uploading user profile photo
 * - `MainNavigator` - Main navigation component shown to authenticated users
 * 
 * @returns {JSX.Element|null} Returns the navigation container with appropriate screens based on auth status, or null while loading
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import SegmentSelectionScreen from './src/screens/SegmentSelectionScreen';
import ProfileCreationScreen from './src/screens/ProfileCreationScreen';
import PhotoUploadScreen from './src/screens/PhotoUploadScreen';
import MainNavigator from './src/navigation/MainNavigator';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Pacifico_400Regular,
  });

  useEffect(() => {
    checkLoginStatus();
    
    // Listen for app state changes to recheck login
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkLoginStatus();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);
    } catch (error) {
      console.log('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="SegmentSelection" component={SegmentSelectionScreen} />
            <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} />
            <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
