# Relun - Dating App

A modern, clean dating app built with React Native that allows users to connect based on their relationship intentions.

## Features

### 🎯 Core Features
- **Segment-based Matching**: Choose between "Relationship" or "Fun" segments
- **Smart Swiping**: Only see people in the same segment as you
- **Real-time Chat**: Text messaging with matches
- **Profile Management**: Create and edit your profile with photos
- **Location-based**: Find matches near you
- **Photo Verification**: Verify your photos (coming soon)

### 📱 Screens
1. **Welcome Screen** - Beautiful gradient introduction
2. **Login/Signup** - Multiple authentication options (Email, Google, Apple, Facebook)
3. **Segment Selection** - Choose your relationship intention
4. **Profile Creation** - Add your details (Name, Age, Gender, Bio)
5. **Photo Upload** - Upload up to 3 photos with location permission
6. **Main Swipe** - Discover and swipe on potential matches
7. **Matches** - View your matches and start conversations
8. **Chat** - One-on-one messaging with safety features
9. **Profile** - Manage your account and settings

### 🎨 Design Features
- Modern, clean UI with dating app aesthetics
- Beautiful gradient colors (Pink: #FF6B9D, Orange: #FF8C42)
- Poppins font family for a professional look
- Smooth animations and transitions
- Responsive design for all screen sizes

### 🔐 Security Features
- Report and block users
- Photo verification system
- Privacy settings
- Safe messaging environment

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app on your phone)

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Start the development server**
```bash
npm start
```

3. **Run on iOS**
```bash
npm run ios
```

4. **Run on Android**
```bash
npm run android
```

5. **Run on Web**
```bash
npm run web
```

## Project Structure

```
relun/
├── App.js                          # Main app entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── babel.config.js                 # Babel configuration
│
├── src/
│   ├── constants/
│   │   └── theme.js               # Colors, fonts, sizes
│   │
│   ├── navigation/
│   │   └── MainNavigator.js       # Bottom tab navigation
│   │
│   └── screens/
│       ├── WelcomeScreen.js       # Landing page
│       ├── LoginScreen.js         # User login
│       ├── SignupScreen.js        # User registration
│       ├── SegmentSelectionScreen.js  # Choose segment
│       ├── ProfileCreationScreen.js   # Create profile
│       ├── PhotoUploadScreen.js       # Upload photos
│       ├── SwipeScreen.js             # Main swiping
│       ├── MatchesScreen.js           # View matches
│       ├── ChatScreen.js              # Messaging
│       ├── ProfileScreen.js           # User profile
│       └── SettingsScreen.js          # App settings
│
└── assets/                        # Images, icons, fonts
```

## Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Async Storage** - Local data persistence
- **Expo Linear Gradient** - Beautiful gradients
- **Expo Image Picker** - Photo selection
- **Expo Location** - Location services
- **Poppins Font** - Typography

## Key Features Implementation

### Segment-Based Matching
Users select their relationship intention:
- 💍 **Relationship** (Free) - For serious connections
- 🎉 **Fun** (Premium features) - For casual dating

### Premium Features (Fun Segment)
- See who likes you
- Unlimited swipes
- Priority matching

### Matching Logic
- Users only see profiles in their selected segment
- Mutual likes create a match
- Location-based recommendations

### Chat System
- Text-only messaging (MVP)
- Real-time updates
- Report/Block functionality
- Safety notifications

## Future Enhancements

- [ ] Backend API integration
- [ ] Real-time messaging with WebSockets
- [ ] Photo verification AI
- [ ] Video profiles
- [ ] Advanced filters
- [ ] Push notifications
- [ ] In-app purchases for premium features
- [ ] Social media integration
- [ ] Distance range customization

## Environment Variables

Create a `.env` file in the root directory:

```env
API_URL=your_api_url
GOOGLE_CLIENT_ID=your_google_client_id
APPLE_CLIENT_ID=your_apple_client_id
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@relun.com or join our Slack channel.

## Acknowledgments

- Design inspired by modern dating apps
- Icons from Ionicons
- Fonts from Google Fonts

---

Made with ❤️ by the Relun Team
