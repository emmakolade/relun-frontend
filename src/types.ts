export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  OTPVerification: { method: 'email' | 'phone' };
  SegmentSelection: undefined;
  ProfileCreation: { segment: string };
  PhotoUpload: undefined;
  Main: undefined;
  Chat: { match: Match };
  Settings: undefined;
  ProfileView: undefined;
};

export type MainTabParamList = {
  Swipe: undefined;
  Matches: undefined;
  Profile: undefined;
};

export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  segment: 'relationship' | 'fun';
  gender?: string;
  location?: any;
}

export interface Match {
  id: string;
  name: string;
  age: number;
  photo: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: boolean;
}
