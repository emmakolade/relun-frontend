import { API_PATHS } from '../config/api';
import { authorizedRequest } from './http';
import { User } from '../types';

type CompleteProfilePayload = {
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bio?: string;
  segment: 'relationship' | 'fun';
  email?: string;
  phone?: string;
};

type UpdateProfilePayload = {
  latitude: number;
  longitude: number;
};

type UpdateEditableProfilePayload = {
  fullName?: string;
  bio?: string;
};

type DiscoverOptions = {
  latitude?: number;
  longitude?: number;
  limit?: number;
};

type DiscoverApiItem = {
  user?: {
    _id?: string;
    id?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  profile?: {
    bio?: string;
    segment?: 'relationship' | 'fun';
  };
  photos?: Array<{
    url?: string;
  }>;
};

type DiscoverApiResponse = {
  users?: DiscoverApiItem[];
};

type UserProfileDetailsResponse = {
  user?: {
    _id?: string;
    id?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  profile?: {
    bio?: string;
    segment?: 'relationship' | 'fun';
    distance?: number;
  };
  photos?: Array<{
    url?: string;
  }>;
};

type ReceivedLikesApiItem = {
  user?: {
    _id?: string;
    id?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  profile?: {
    bio?: string;
    segment?: 'relationship' | 'fun';
  };
  photos?: Array<{
    url?: string;
  }>;
};

type ReceivedLikesApiResponse = {
  likes?: ReceivedLikesApiItem[];
};

export type LikeUserResponse = {
  liked: boolean;
  isMutual?: boolean;
  alreadyLiked?: boolean;
  targetUserId: string;
};

export type UploadedPhoto = {
  _id: string;
  userId: string;
  url: string;
  publicId?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

type CurrentUserProfileResponse = {
  user?: {
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    phone?: string;
  };
  profile?: {
    bio?: string;
    segment?: 'relationship' | 'fun';
  };
  photos?: Array<{
    _id?: string;
    url?: string;
    order?: number;
  }>;
};

export type CurrentUserPhoto = {
  id: string;
  url: string;
  order: number;
};

export type CurrentUserProfile = {
  name: string;
  age: string;
  gender: string;
  bio: string;
  segment: string;
  photos: (string | null)[];
  email?: string;
  phone?: string;
};

export type CurrentUserProfileDetails = CurrentUserProfile & {
  photoDetails: CurrentUserPhoto[];
};

export const completeProfile = async (payload: CompleteProfilePayload) => {
  return authorizedRequest<Record<string, unknown>>(API_PATHS.completeProfile, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

export const updateProfileLocation = async (payload: UpdateProfilePayload) => {
  return authorizedRequest<Record<string, unknown>>(API_PATHS.updateProfile, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

export const updateEditableProfile = async (payload: UpdateEditableProfilePayload) => {
  return authorizedRequest<Record<string, unknown>>(API_PATHS.updateProfile, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

export const getCurrentUserProfileDetails = async (): Promise<CurrentUserProfileDetails> => {
  const response = await authorizedRequest<CurrentUserProfileResponse>(API_PATHS.updateProfile, {
    method: 'GET',
  });

  const photoDetails = (response.photos || [])
    .map((photo) => ({
      id: photo._id || '',
      url: photo.url || '',
      order: typeof photo.order === 'number' ? photo.order : Number.MAX_SAFE_INTEGER,
    }))
    .filter((photo) => !!photo.id && !!photo.url)
    .sort((a, b) => a.order - b.order);

  const photoUrls = photoDetails.map((photo) => photo.url);

  const age = response.user?.dateOfBirth ? String(getAgeFromDate(response.user.dateOfBirth)) : '';

  return {
    name: response.user?.fullName || '',
    age,
    gender: response.user?.gender || '',
    bio: response.profile?.bio || '',
    segment: response.profile?.segment || 'relationship',
    photos: photoUrls.length > 0 ? photoUrls : [null, null, null],
    email: response.user?.email || '',
    phone: response.user?.phone || '',
    photoDetails,
  };
};

export const getCurrentUserProfile = async (): Promise<CurrentUserProfile> => {
  const details = await getCurrentUserProfileDetails();

  return {
    name: details.name,
    age: details.age,
    gender: details.gender,
    bio: details.bio,
    segment: details.segment,
    photos: details.photos,
    email: details.email,
    phone: details.phone,
  };
};

export const deleteProfilePhoto = async (photoId: string): Promise<{ message: string }> => {
  return authorizedRequest<{ message: string }>(`${API_PATHS.uploadPhotos}/${photoId}`, {
    method: 'DELETE',
  });
};

export const replaceProfilePhoto = async (photoId: string, uri: string): Promise<UploadedPhoto> => {
  const formData = new FormData();

  formData.append('photo', {
    uri,
    type: getMimeType(uri),
    name: getFileName(uri, 0),
  } as any);

  return authorizedRequest<UploadedPhoto>(`${API_PATHS.uploadPhotos}/${photoId}`, {
    method: 'PATCH',
    body: formData,
  });
};

const getAgeFromDate = (value?: string) => {
  if (!value) return 18;

  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) {
    return 18;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return Math.max(age, 18);
};

const mapDiscoverUser = (item: DiscoverApiItem): User | null => {
  const id = item.user?._id || item.user?.id;
  if (!id) {
    return null;
  }

  const photos = (item.photos || [])
    .map((photo) => photo.url)
    .filter((url): url is string => !!url);

  return {
    id,
    name: item.user?.fullName || 'User',
    age: getAgeFromDate(item.user?.dateOfBirth),
    bio: item.profile?.bio || '',
    photos,
    segment: item.profile?.segment === 'fun' ? 'fun' : 'relationship',
    gender: item.user?.gender,
    location: item.profile,
  };
};

const mapReceivedLikeUser = (item: ReceivedLikesApiItem): User | null => {
  const id = item.user?._id || item.user?.id;
  if (!id) {
    return null;
  }

  const photos = (item.photos || [])
    .map((photo) => photo.url)
    .filter((url): url is string => !!url);

  return {
    id,
    name: item.user?.fullName || 'User',
    age: getAgeFromDate(item.user?.dateOfBirth),
    bio: item.profile?.bio || 'Liked your profile',
    photos,
    segment: item.profile?.segment === 'fun' ? 'fun' : 'relationship',
    gender: item.user?.gender,
    location: item.profile,
  };
};

export const getDiscoverUsers = async (options?: DiscoverOptions): Promise<User[]> => {
  const params = new URLSearchParams();

  if (typeof options?.latitude === 'number') {
    params.set('latitude', String(options.latitude));
  }

  if (typeof options?.longitude === 'number') {
    params.set('longitude', String(options.longitude));
  }

  if (typeof options?.limit === 'number') {
    params.set('limit', String(options.limit));
  }

  const query = params.toString();
  const path = query ? `${API_PATHS.discover}?${query}` : API_PATHS.discover;

  const response = await authorizedRequest<DiscoverApiResponse>(path, {
    method: 'GET',
  });

  const users = response.users || [];
  return users
    .map(mapDiscoverUser)
    .filter((user): user is User => !!user);
};

export const getUserProfileById = async (targetUserId: string): Promise<User> => {
  const response = await authorizedRequest<UserProfileDetailsResponse>(
    `${API_PATHS.profileBase}/${targetUserId}`,
    {
      method: 'GET',
    }
  );

  const id = response.user?._id || response.user?.id || targetUserId;
  const photos = (response.photos || [])
    .map((photo) => photo.url)
    .filter((url): url is string => !!url);

  return {
    id,
    name: response.user?.fullName || 'User',
    age: getAgeFromDate(response.user?.dateOfBirth),
    bio: response.profile?.bio || '',
    photos,
    segment: response.profile?.segment === 'fun' ? 'fun' : 'relationship',
    gender: response.user?.gender,
    location: response.profile,
  };
};

export const likeUser = async (targetUserId: string): Promise<LikeUserResponse> => {
  return authorizedRequest<LikeUserResponse>(`${API_PATHS.likes}/${targetUserId}`, {
    method: 'POST',
  });
};

export const unlikeUser = async (targetUserId: string): Promise<LikeUserResponse> => {
  return authorizedRequest<LikeUserResponse>(`${API_PATHS.likes}/${targetUserId}`, {
    method: 'DELETE',
  });
};

export const getLikeStatus = async (targetUserId: string): Promise<LikeUserResponse> => {
  return authorizedRequest<LikeUserResponse>(`${API_PATHS.likes}/${targetUserId}/status`, {
    method: 'GET',
  });
};

export const getMatches = async (): Promise<User[]> => {
  const response = await authorizedRequest<{ matches?: DiscoverApiItem[] }>(API_PATHS.matches, {
    method: 'GET',
  });

  // Same {user, profile, photos} envelope as discover, so it maps the same way.
  return (response.matches || []).map(mapDiscoverUser).filter((user): user is User => !!user);
};

export const getReceivedLikes = async (limit = 100): Promise<User[]> => {
  const response = await authorizedRequest<ReceivedLikesApiResponse>(
    `${API_PATHS.likes}/received?limit=${limit}`,
    {
      method: 'GET',
    }
  );

  const likes = response.likes || [];
  return likes.map(mapReceivedLikeUser).filter((user): user is User => !!user);
};

const getMimeType = (uri: string) => {
  const lower = uri.toLowerCase();

  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  return 'image/jpeg';
};

const getFileName = (uri: string, index: number) => {
  const lastSegment = uri.split('/').pop();
  if (lastSegment && lastSegment.includes('.')) {
    return lastSegment;
  }

  const mime = getMimeType(uri);
  const ext = mime.split('/')[1] || 'jpg';
  return `photo-${index + 1}.${ext}`;
};

const uploadPhotoBatch = async (uris: string[]): Promise<UploadedPhoto[]> => {
  const formData = new FormData();

  uris.forEach((uri, index) => {
    formData.append('photos', {
      uri,
      type: getMimeType(uri),
      name: getFileName(uri, index),
    } as any);
  });

  const response = await authorizedRequest<UploadedPhoto | UploadedPhoto[]>(API_PATHS.uploadPhotos, {
    method: 'POST',
    body: formData,
  });

  return Array.isArray(response) ? response : [response];
};

export const uploadProfilePhotos = async (
  uris: string[],
  options?: { minimumRequired?: number }
): Promise<UploadedPhoto[]> => {
  if (uris.length === 0) {
    throw new Error('No photos selected.');
  }

  const minimumRequired = options?.minimumRequired ?? 0;
  if (minimumRequired > 0 && uris.length < minimumRequired) {
    throw new Error(`Please upload at least ${minimumRequired} photos.`);
  }

  const chunks: string[][] = [];
  for (let i = 0; i < uris.length; i += 3) {
    chunks.push(uris.slice(i, i + 3));
  }

  const uploadedPhotos: UploadedPhoto[] = [];

  for (const chunk of chunks) {
    const batchPhotos = await uploadPhotoBatch(chunk);
    uploadedPhotos.push(...batchPhotos);
  }

  return uploadedPhotos.sort((a, b) => a.order - b.order);
};
