import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';

import { RootStackParamList } from './src/types';
import { ToastProvider } from './src/components';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import SegmentSelectionScreen from './src/screens/SegmentSelectionScreen';
import ProfileCreationScreen from './src/screens/ProfileCreationScreen';
import PhotoUploadScreen from './src/screens/PhotoUploadScreen';
import LocationPermissionScreen from './src/screens/LocationPermissionScreen';
import MainNavigator from './src/navigation/MainNavigator';
import ChatScreen from './src/screens/ChatScreen';
import ProfileViewScreen from './src/screens/ProfileViewScreen';
import GetCoinsScreen from './src/screens/GetCoinsScreen';
import { getStoredAccessToken, subscribeToAuthState } from './src/services/auth.service';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  let [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Pacifico_400Regular,
  });

  useEffect(() => {
    checkLoginStatus();

    const unsubscribeAuthState = subscribeToAuthState(() => {
      void checkLoginStatus();
    });

    // Listen for app state changes to recheck login
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkLoginStatus();
      }
    });

    return () => {
      unsubscribeAuthState();
      subscription?.remove();
    };
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await getStoredAccessToken();
      const hasProfile = await AsyncStorage.getItem('hasProfile');
      const isProfileComplete = hasProfile === 'true';
      setIsLoggedIn(!!userToken && isProfileComplete);
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
    <ToastProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#FAFAFA' },
          }}
          initialRouteName="Welcome"
        >
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="SegmentSelection" component={SegmentSelectionScreen} />
            <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} />
            <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
            <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="ProfileView" component={ProfileViewScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="GetCoins" component={GetCoinsScreen} />
          </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}
