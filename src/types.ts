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
  ProfileView: { user: User };
  GetCoins: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  DateRequests: undefined;
  GetCoins: undefined;
  Matches: undefined;
  Profile: undefined;
};

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface DatePost {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  age: number;
  activity: string; 
  location: string;
  dateTime: string;
  description: string;
  segment: 'relationship' | 'fun';
  requests?: Request[];
}

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
