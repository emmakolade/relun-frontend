import { API_BASE_URL, API_BASE_URL_HINT } from '../config/api';
import { clearAuthSession, getValidAccessToken, refreshAuthSession } from './auth.service';

export const parseErrorMessage = async (response: Response) => {
  try {
    const body = await response.json();

    if (body?.error) {
      return body.error as string;
    }

    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      return body.errors[0].msg || 'Request failed';
    }
  } catch (_error) {
    // ignore JSON parse errors and fallback below
  }

  return response.statusText || 'Request failed';
};

const getAuthHeaders = async (extraHeaders?: Record<string, string>) => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated. Please log in again.');
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders,
  };
};

export const authorizedRequest = async <TResponse>(
  path: string,
  options: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> }
) => {
  const buildRequest = async (headers: Record<string, string>) => {
    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    } catch (_error) {
      throw new Error(`Network request failed. Using ${API_BASE_URL}. ${API_BASE_URL_HINT}`);
    }
  };

  const headers = await getAuthHeaders(options.headers);

  let response = await buildRequest(headers);

  if (response.status === 401) {
    const refreshedToken = await refreshAuthSession();

    if (!refreshedToken) {
      await clearAuthSession();
      throw new Error('Session is invalid or expired. Please log in again.');
    }

    const retryHeaders = {
      ...(options.headers || {}),
      Authorization: `Bearer ${refreshedToken}`,
    };

    response = await buildRequest(retryHeaders);
  }

  if (!response.ok) {
    if (response.status === 401) {
      await clearAuthSession();
      throw new Error('Session is invalid or expired. Please log in again.');
    }

    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
};
