const fallbackBaseUrl = 'http://localhost:9000';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || fallbackBaseUrl;

export const API_PATHS = {
  requestOtp: '/api/auth/request-otp',
  verifyOtp: '/api/auth/verify-otp',
  login: '/api/auth/login',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
} as const;
