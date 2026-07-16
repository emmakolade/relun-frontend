import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_PATHS } from '../config/api';

const STORAGE_KEYS = {
  accessToken: 'userToken',
  refreshToken: 'refreshToken',
  authMethod: 'authMethod',
  userEmail: 'userEmail',
  userPhone: 'userPhone',
  hasProfile: 'hasProfile',
} as const;

type AuthMethod = 'email' | 'phone';

type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  needsProfileCompletion: boolean;
  needsEmail: boolean;
  needsPhone: boolean;
};

type RequestOtpPayload = {
  email?: string;
  phone?: string;
};

type VerifyOtpPayload = {
  email?: string;
  phone?: string;
  otp: string;
};

type LoginPayload = {
  email?: string;
  phone?: string;
};

const parseErrorMessage = async (response: Response) => {
  try {
    const body = await response.json();

    if (body?.error) {
      return body.error as string;
    }

    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      return body.errors[0].msg || 'Request failed';
    }
  } catch (_error) {
    // ignore JSON parse errors and fallback to status text below
  }

  return response.statusText || 'Request failed';
};

const postJson = async <TResponse>(path: string, payload: Record<string, unknown>) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  return (await response.json()) as TResponse;
};

export const requestOtp = async (payload: RequestOtpPayload) => {
  return postJson<{ message: string; isNewUser: boolean }>(API_PATHS.requestOtp, payload);
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  return postJson<AuthResponse>(API_PATHS.verifyOtp, payload);
};

export const login = async (payload: LoginPayload) => {
  return postJson<AuthResponse>(API_PATHS.login, payload);
};

export const persistAuthSession = async (
  authData: AuthResponse,
  authMethod: AuthMethod,
  contact: string
) => {
  const keyForContact = authMethod === 'email' ? STORAGE_KEYS.userEmail : STORAGE_KEYS.userPhone;

  await AsyncStorage.multiSet([
    [STORAGE_KEYS.accessToken, authData.accessToken],
    [STORAGE_KEYS.refreshToken, authData.refreshToken],
    [STORAGE_KEYS.authMethod, authMethod],
    [keyForContact, contact],
    [STORAGE_KEYS.hasProfile, authData.needsProfileCompletion ? 'false' : 'true'],
  ]);
};

export const getStoredAccessToken = async () => {
  return AsyncStorage.getItem(STORAGE_KEYS.accessToken);
};
