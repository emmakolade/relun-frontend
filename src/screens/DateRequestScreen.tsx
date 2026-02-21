import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { DatePost, RootStackParamList, Request, Match, User } from '../types';

// Mock Data
const MOCK_DATES: DatePost[] = [
  {
    id: '1',
    userId: '101',
    userName: 'Jessica',
    age: 24,
    userPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    activity: 'Movie Night 🎬',
    location: 'AMC Theater, Downtown',
    dateTime: 'Tonight, 8:00 PM',
    description: 'Looking for someone to watch the new Marvel movie with! Popcorn on me.',
    segment: 'fun',
  },
  {
    id: '2',
    userId: '102',
    userName: 'David',
    age: 28,
    userPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    activity: 'Coffee Date ☕️',
    location: 'Starbucks, 5th Ave',
    dateTime: 'Tomorrow, 10:00 AM',
    description: 'Casual coffee chat to get to know each other.',
    segment: 'relationship',
  },
  {
    id: '3',
    userId: '103',
    userName: 'Sarah',
    age: 26,
    userPhoto: 'https://randomuser.me/api/portraits/women/65.jpg',
    activity: 'Hiking Adventure 🥾',
    location: 'Sunset Trail',
    dateTime: 'Saturday, 7:00 AM',
    description: 'Early morning hike. Lets catch the sunrise!',
    segment: 'relationship',
  },
  {
    id: '4',
    userId: 'root', // Current User
    userName: 'You',
    age: 25,
    userPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
    activity: 'Weekend Brunch 🥞',
    location: 'Sunny Side Cafe',
    dateTime: 'Sunday, 11:00 AM',
    description: 'Anyone up for some pancakes?',
    segment: 'fun',
    requests: [
        { id: 'r1', userId: '201', userName: 'Emily', userPhoto: 'https://randomuser.me/api/portraits/women/12.jpg', status: 'pending' },
        { id: 'r2', userId: '202', userName: 'Chloe', userPhoto: 'https://randomuser.me/api/portraits/women/24.jpg', status: 'pending' }
    ]
  },
];

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function DateRequestScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [dates, setDates] = useState<DatePost[]>(MOCK_DATES);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-dates'>('browse');
  
  // Creation States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDateActivity, setNewDateActivity] = useState('');
  const [newDateLocation, setNewDateLocation] = useState('');
  const [newDateDescription, setNewDateDescription] = useState('');

  const currentUserId = 'root';

  const handleJoin = (datePost: DatePost) => {
    Alert.alert(
      "Safety First 🛡️",
      "Please ensure your first meeting is in a public, open place. Do not go to private residences or secluded areas for your safety.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "I Understand", 
          onPress: () => {
             Alert.alert(
              "Join Date?",
              `Send interest to ${datePost.userName} for ${datePost.activity}?`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Send Request", 
                  onPress: () => Alert.alert("Request Sent!", "They will be notified of your interest.") 
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleCreateDate = () => {
    if (!newDateActivity || !newDateLocation) {
      Alert.alert("Missing Info", "Please fill in activity and location.");
      return;
    }

    const newPost: DatePost = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: 'You',
      age: 25,
      userPhoto: 'https://randomuser.me/api/portraits/men/1.jpg', // placeholder
      activity: newDateActivity,
      location: newDateLocation,
      dateTime: 'TBD',
      description: newDateDescription,
      segment: 'fun',
      requests: []
    };

    setDates([newPost, ...dates]);
    setShowCreateModal(false);
    setNewDateActivity('');
    setNewDateLocation('');
    setNewDateDescription('');
    setActiveTab('my-dates'); // Switch to view newly created date
    Alert.alert("Success", "Your date request is live!");
  };

  const handleAcceptRequest = (dateId: string, request: Request) => {
    // 1. Update request status to accepted locally
    const updatedDates = dates.map(d => {
        if (d.id === dateId && d.requests) {
            return {
                ...d,
                requests: d.requests.map(r => r.id === request.id ? { ...r, status: 'accepted' as const } : r)
            };
        }
        return d;
    });
    setDates(updatedDates);

    // 2. Navigate to Chat
    const matchData: Match = {
        id: request.userId,
        name: request.userName,
        age: 24, // Mock age
        photo: request.userPhoto,
        timestamp: new Date().toISOString(),
    };
    
    Alert.alert("Date Accepted! 🎉", `Start planning with ${request.userName}!`, [
        { text: "Start Chat", onPress: () => navigation.navigate('Chat', { match: matchData }) }
    ]);
  };

  const handleDeclineRequest = (dateId: string, requestId: string) => {
    const updatedDates = dates.map(d => {
        if (d.id === dateId && d.requests) {
            return {
                ...d,
                requests: d.requests.filter(r => r.id !== requestId) // Remove rejected
            };
        }
        return d;
    });
    setDates(updatedDates);
  };

  const viewUserProfile = (request: Request) => {
    // Construct a temporary User object since Request doesn't have all fields
    const tempUser: User = {
      id: request.userId,
      name: request.userName,
      age: 25, // Mock data as Request simple interface doesn't store this
      bio: `Interested in joining for ${request.userName}'s activity.`,
      photos: [request.userPhoto, 'https://via.placeholder.com/400'], // Mock additional photo
      segment: 'fun', // Default
    };
    navigation.navigate('ProfileView', { user: tempUser });
  };

  const renderItem = ({ item }: { item: DatePost }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.userPhoto }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.userName}>{item.userName}, {item.age}</Text>
          <View style={[
            styles.segmentBadge, 
            { backgroundColor: item.segment === 'relationship' ? 'rgba(255, 75, 125, 0.1)' : 'rgba(255, 159, 28, 0.1)' }
          ]}>
            <Text style={[
              styles.segmentText,
              { color: item.segment === 'relationship' ? COLORS.primary : COLORS.fun }
            ]}>
              {item.segment === 'relationship' ? 'Relationship' : 'Fun'}
            </Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>2h ago</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.activityTitle}>{item.activity}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.dateTime}</Text>
        </View>
        {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
      </View>

      <TouchableOpacity 
        style={styles.joinButton}
        onPress={() => handleJoin(item)}
      >
        <Text style={styles.joinButtonText}>I'm Interested 👋</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMyDateItem = ({ item }: { item: DatePost }) => (
    <View style={styles.card}>
       <View style={styles.myDateHeader}>
           <Text style={styles.myDateActivity}>{item.activity}</Text>
           <TouchableOpacity onPress={() => Alert.alert("Options", "Edit or Delete Date")}>
               <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
           </TouchableOpacity>
       </View>
       
       <View style={{flexDirection: 'row', marginBottom: 15}}>
          <Text style={[styles.detailText, {marginLeft: 0, marginRight: 15}]}>
            <Ionicons name="location-outline" size={14} /> {item.location}
          </Text>
           <Text style={[styles.detailText, {marginLeft: 0}]}>
            <Ionicons name="calendar-outline" size={14} /> {new Date(item.dateTime).toLocaleDateString()}
          </Text>
       </View>

       {/* Incoming Requests Section */}
       <View style={styles.requestsContainer}>
           <Text style={styles.requestsTitle}>
               {item.requests?.length ? `Requests (${item.requests.length})` : 'No requests yet'}
           </Text>
           
           {item.requests?.map(request => (
               <View key={request.id} style={styles.requestItem}>
                   <TouchableOpacity 
                     style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
                     onPress={() => viewUserProfile(request)}
                   >
                     <Image source={{ uri: request.userPhoto }} style={styles.requestAvatar} />
                     <View style={styles.requestInfo}>
                         <Text style={styles.requestName}>{request.userName}</Text>
                         <Text style={styles.requestStatus}>{request.status === 'pending' ? 'Wants to join' : 'Accepted'}</Text>
                     </View>
                   </TouchableOpacity>
                   
                   {request.status === 'pending' && (
                       <View style={styles.actionButtons}>
                           <TouchableOpacity 
                               style={[styles.actionBtn, styles.declineBtn]}
                               onPress={() => handleDeclineRequest(item.id, request.id)}
                           >
                               <Ionicons name="close" size={20} color={COLORS.error} />
                           </TouchableOpacity>
                           <TouchableOpacity 
                               style={[styles.actionBtn, styles.acceptBtn]}
                               onPress={() => handleAcceptRequest(item.id, request)}
                           >
                               <Ionicons name="checkmark" size={20} color={COLORS.white} />
                           </TouchableOpacity>
                       </View>
                   )}
                    {request.status === 'accepted' && (
                       <View style={styles.acceptedBadge}>
                           <Text style={styles.acceptedText}>Chatting</Text>
                       </View>
                   )}
               </View>
           ))}
       </View>
    </View>
  );

  const filteredDates = activeTab === 'browse' 
      ? dates.filter(d => d.userId !== currentUserId)
      : dates.filter(d => d.userId === currentUserId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Date Requests</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'browse' && styles.activeTab]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'my-dates' && styles.activeTab]}
          onPress={() => setActiveTab('my-dates')}
        >
          <Text style={[styles.tabText, activeTab === 'my-dates' && styles.activeTabText]}>My Dates</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDates}
        renderItem={activeTab === 'browse' ? renderItem : renderMyDateItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
                {activeTab === 'browse' ? "No dates found." : "You haven't posted any dates yet."}
            </Text>
          </View>
        }
      />

      {/* Create Date Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post a Date</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Activity (e.g., Dinner, Movie)</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you want to do?"
              value={newDateActivity}
              onChangeText={setNewDateActivity}
            />

            <Text style={styles.inputLabel}>Location & Time</Text>
            <TextInput
              style={styles.input}
              placeholder="Where and when?"
              value={newDateLocation}
              onChangeText={setNewDateLocation}
            />

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add more details..."
              value={newDateDescription}
              onChangeText={setNewDateDescription}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleCreateDate}
            >
              <Text style={styles.submitButtonText}>Post Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  tabButton: {
    marginRight: 20,
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  segmentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  segmentText: {
    fontSize: 10,
    fontFamily: FONTS.semiBold,
    textTransform: 'uppercase',
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: FONTS.regular,
  },
  cardBody: {
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    marginTop: 8,
    lineHeight: 20,
  },
  joinButton: {
    backgroundColor: COLORS.grayLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  // My Dates Styles
  myDateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
  },
  myDateActivity: {
      fontSize: 18,
      fontFamily: FONTS.bold,
      color: COLORS.text,
  },
  myDateLocation: {
      fontSize: 14,
      color: COLORS.textSecondary,
      fontFamily: FONTS.medium,
      marginBottom: 15,
  },
  requestsContainer: {
      borderTopWidth: 1,
      borderTopColor: COLORS.grayLight,
      paddingTop: 15,
  },
  requestsTitle: {
      fontSize: 14,
      fontFamily: FONTS.bold,
      color: COLORS.textSecondary,
      marginBottom: 10,
  },
  requestItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
  },
  requestAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
  },
  requestInfo: {
      flex: 1,
  },
  requestName: {
      fontSize: 15,
      fontFamily: FONTS.bold,
      color: COLORS.text,
  },
  requestStatus: {
      fontSize: 12,
      color: COLORS.textLight,
  },
  actionButtons: {
      flexDirection: 'row',
  },
  actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
  },
  acceptBtn: {
      backgroundColor: COLORS.success,
  },
  declineBtn: {
      backgroundColor: COLORS.grayLight,
  },
  acceptedBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: COLORS.grayLight,
      borderRadius: 10,
  },
  acceptedText: {
      fontSize: 12,
      color: COLORS.text,
      fontFamily: FONTS.medium,
  },
  emptyState: {
      padding: 40,
      alignItems: 'center',
  },
  emptyStateText: {
      color: COLORS.textLight,
      fontFamily: FONTS.medium,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
    padding: 12,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    ...SHADOWS.medium,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
