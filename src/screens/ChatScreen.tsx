import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useToast, ConfirmDialog } from '../components';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

// Mock messages
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hey! How are you?',
    senderId: '2',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    text: "Hi! I'm doing great, thanks for asking! How about you?",
    senderId: '1',
    timestamp: new Date(Date.now() - 3000000),
  },
  {
    id: '3',
    text: "I'm good! I saw you like traveling. Where's your favorite place?",
    senderId: '2',
    timestamp: new Date(Date.now() - 2400000),
  },
  {
    id: '4',
    text: 'Oh wow, I love Bali! The beaches are amazing',
    senderId: '1',
    timestamp: new Date(Date.now() - 1800000),
  },
];

type Props = StackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ navigation, route }: Props) {
  const { match } = route.params;
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);
  const currentUserId = '1'; // Mock current user ID
  const { showToast } = useToast();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText.trim(),
        senderId: currentUserId,
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const handleReport = () => {
    setShowReportDialog(true);
  };

  const confirmReport = () => {
    setShowReportDialog(false);
    showToast({
      type: 'success',
      title: 'Reported',
      message: 'User has been reported. We will review this case.',
    });
  };

  const handleBlock = () => {
    setShowBlockDialog(true);
  };

  const confirmBlock = () => {
    setShowBlockDialog(false);
    showToast({
      type: 'info',
      title: 'Blocked',
      message: 'User has been blocked successfully.',
    });
    navigation.goBack();
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
        <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {match.name}, {match.age}
          </Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowActionsMenu(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textLight}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? COLORS.white : COLORS.textLight}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety Notice */}
      <View style={styles.safetyNotice}>
        <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
        <Text style={styles.safetyText}>
          Keep your conversations safe. Report any suspicious behavior.
        </Text>
      </View>

      <ConfirmDialog
        visible={showReportDialog}
        title="Report User"
        message="Are you sure you want to report this user?"
        confirmText="Report"
        cancelText="Cancel"
        destructive
        onConfirm={confirmReport}
        onCancel={() => setShowReportDialog(false)}
      />

      <ConfirmDialog
        visible={showBlockDialog}
        title="Block User"
        message="Are you sure you want to block this user? You will no longer see their messages."
        confirmText="Block"
        cancelText="Cancel"
        destructive
        onConfirm={confirmBlock}
        onCancel={() => setShowBlockDialog(false)}
      />

      {/* Actions Menu */}
      <Modal
        visible={showActionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionsMenu(false)}
      >
        <TouchableOpacity 
          style={styles.actionMenuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowActionsMenu(false)}
        >
          <View style={styles.actionMenuContainer}>
            <Text style={styles.actionMenuTitle}>Actions</Text>
            <TouchableOpacity 
              style={styles.actionMenuItem}
              onPress={() => {
                setShowActionsMenu(false);
                handleReport();
              }}
            >
              <Ionicons name="flag-outline" size={22} color={COLORS.text} />
              <Text style={styles.actionMenuText}>Report User</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionMenuItem, styles.actionMenuDestructive]}
              onPress={() => {
                setShowActionsMenu(false);
                handleBlock();
              }}
            >
              <Ionicons name="ban-outline" size={22} color={COLORS.primary} />
              <Text style={[styles.actionMenuText, { color: COLORS.primary }]}>Block User</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionMenuItem, styles.actionMenuCancel]}
              onPress={() => setShowActionsMenu(false)}
            >
              <Text style={styles.actionMenuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 2,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  onlineText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.success,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContent: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '75%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: SIZES.radiusLarge,
    marginBottom: 4,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.grayLight,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  ownMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  inputContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZES.radiusLarge,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    gap: 8,
  },
  safetyText: {
    flex: 1,
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  actionMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionMenuContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: SIZES.padding,
  },
  actionMenuTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  actionMenuDestructive: {
    borderBottomWidth: 0,
  },
  actionMenuText: {
    fontSize: 17,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  actionMenuCancel: {
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.grayLight,
    borderRadius: 14,
    borderBottomWidth: 0,
  },
  actionMenuCancelText: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
