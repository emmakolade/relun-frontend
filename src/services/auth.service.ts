import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_BASE_URL_HINT, API_PATHS } from '../config/api';

type AuthStateListener = (isLoggedIn: boolean) => void;

const authStateListeners = new Set<AuthStateListener>();

const notifyAuthStateChanged = async () => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.accessToken);
  const isLoggedIn = !!token;
  authStateListeners.forEach((listener) => listener(isLoggedIn));
};

export const subscribeToAuthState = (listener: AuthStateListener) => {
  authStateListeners.add(listener);

  return () => {
    authStateListeners.delete(listener);
  };
};

export const refreshAuthState = async () => {
  await notifyAuthStateChanged();
};

const STORAGE_KEYS = {
  accessToken: 'userToken',
  refreshToken: 'refreshToken',
  userId: 'userId',
  authMethod: 'authMethod',
  userEmail: 'userEmail',
  userPhone: 'userPhone',
  hasProfile: 'hasProfile',
} as const;

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

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

type ClearAuthSessionOptions = {
  preserveIdentity?: boolean;
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
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (_error) {
    throw new Error(`Network request failed. Using ${API_BASE_URL}. ${API_BASE_URL_HINT}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      await clearAuthSession({ preserveIdentity: true });
      throw new Error('Session is invalid or expired. Please log in again.');
    }

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

export const logout = async () => {
  const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.accessToken);

  if (!accessToken) {
    return;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${API_PATHS.logout}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (_error) {
    throw new Error(`Network request failed. Using ${API_BASE_URL}. ${API_BASE_URL_HINT}`);
  }

  if (!response.ok && response.status !== 401) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }
};

export const refreshAuthSession = async (): Promise<string | null> => {
  const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.refreshToken);

  if (!storedRefreshToken) {
    await clearAuthSession({ preserveIdentity: true });
    return null;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${API_PATHS.refresh}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });
  } catch (_error) {
    throw new Error(`Network request failed. Using ${API_BASE_URL}. ${API_BASE_URL_HINT}`);
  }

  if (!response.ok) {
    await clearAuthSession({ preserveIdentity: true });
    return null;
  }

  const tokens = (await response.json()) as TokenPair;

  if (!tokens?.accessToken || !tokens?.refreshToken) {
    await clearAuthSession({ preserveIdentity: true });
    return null;
  }

  await AsyncStorage.multiSet([
    [STORAGE_KEYS.accessToken, tokens.accessToken],
    [STORAGE_KEYS.refreshToken, tokens.refreshToken],
  ]);

  return tokens.accessToken;
};

const recoverSessionFromStoredIdentity = async (): Promise<string | null> => {
  const authMethod = await AsyncStorage.getItem(STORAGE_KEYS.authMethod);
  const userEmail = await AsyncStorage.getItem(STORAGE_KEYS.userEmail);
  const userPhone = await AsyncStorage.getItem(STORAGE_KEYS.userPhone);

  let payload: LoginPayload | null = null;
  let method: AuthMethod | null = null;
  let contact = '';

  if (authMethod === 'email' && userEmail) {
    payload = { email: userEmail };
    method = 'email';
    contact = userEmail;
  } else if (authMethod === 'phone' && userPhone) {
    payload = { phone: userPhone };
    method = 'phone';
    contact = userPhone;
  } else if (userEmail) {
    payload = { email: userEmail };
    method = 'email';
    contact = userEmail;
  } else if (userPhone) {
    payload = { phone: userPhone };
    method = 'phone';
    contact = userPhone;
  }

  if (!payload || !method) {
    return null;
  }

  try {
    const authData = await login(payload);
    await persistAuthSession(authData, method, contact);
    return authData.accessToken;
  } catch (_error) {
    return null;
  }
};

export const getValidAccessToken = async (): Promise<string | null> => {
  const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.accessToken);

  if (accessToken) {
    return accessToken;
  }

  const refreshedToken = await refreshAuthSession();
  if (refreshedToken) {
    return refreshedToken;
  }

  return recoverSessionFromStoredIdentity();
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
    [STORAGE_KEYS.userId, authData.user.id],
    [STORAGE_KEYS.authMethod, authMethod],
    [keyForContact, contact],
    [STORAGE_KEYS.hasProfile, authData.needsProfileCompletion ? 'false' : 'true'],
  ]);

  await notifyAuthStateChanged();
};

export const clearAuthSession = async (options?: ClearAuthSessionOptions) => {
  const keysToRemove: string[] = [
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.refreshToken,
    STORAGE_KEYS.userId,
    STORAGE_KEYS.hasProfile,
  ];

  if (!options?.preserveIdentity) {
    keysToRemove.push(
      STORAGE_KEYS.authMethod,
      STORAGE_KEYS.userEmail,
      STORAGE_KEYS.userPhone
    );
  }

  await AsyncStorage.multiRemove(keysToRemove);

  await notifyAuthStateChanged();
};

export const getStoredAccessToken = async () => {
  return AsyncStorage.getItem(STORAGE_KEYS.accessToken);
};

// Chat needs the current user's id to tell own messages from the other side's.
export const getStoredUserId = async () => {
  return AsyncStorage.getItem(STORAGE_KEYS.userId);
};
