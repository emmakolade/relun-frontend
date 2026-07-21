import { Platform } from 'react-native';

const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const androidEnvBaseUrl = process.env.EXPO_PUBLIC_ANDROID_API_BASE_URL?.trim();

const nativeFallbackBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:9000' : 'http://localhost:9000';
const webFallbackBaseUrl = 'http://localhost:9000';

const fallbackBaseUrl = Platform.OS === 'web' ? webFallbackBaseUrl : nativeFallbackBaseUrl;

const isLoopbackUrl = (value?: string) => {
  if (!value) return false;

  try {
    const host = new URL(value).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch (_error) {
    return false;
  }
};

const resolveBaseUrl = () => {
  if (Platform.OS === 'android') {
    if (androidEnvBaseUrl) {
      return androidEnvBaseUrl;
    }

    if (isLoopbackUrl(envBaseUrl)) {
      return nativeFallbackBaseUrl;
    }
  }

  return envBaseUrl || fallbackBaseUrl;
};

const rawBaseUrl = resolveBaseUrl();

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const API_BASE_URL_HINT =
  'If you are testing on a physical Android device, set EXPO_PUBLIC_ANDROID_API_BASE_URL to your machine LAN IP (for example, http://192.168.1.10:9000) or use your deployed HTTPS backend URL.';

if (__DEV__) {
  console.log('[API] Base URL:', API_BASE_URL);
}

export const API_PATHS = {
  requestOtp: '/api/auth/request-otp',
  verifyOtp: '/api/auth/verify-otp',
  login: '/api/auth/login',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
  completeProfile: '/api/profiles/complete-profile',
  updateProfile: '/api/profiles',
  profileBase: '/api/profiles',
  discover: '/api/profiles/discover',
  likes: '/api/profiles/likes',
  uploadPhotos: '/api/profiles/photos',
} as const;
