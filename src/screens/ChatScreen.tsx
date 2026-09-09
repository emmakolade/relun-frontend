import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import type { Socket } from 'socket.io-client';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useToast, ConfirmDialog } from '../components';
import {
  ChatMessage,
  NewMessageEvent,
  UserTypingEvent,
  MessagesReadEvent,
  PresenceEvent,
  getMessages,
  mapMessage,
} from '../services/chat.service';
import { getSocket } from '../services/socket';
import { getStoredUserId } from '../services/auth.service';

// How long after the last keystroke we tell the other side typing has stopped.
const TYPING_IDLE_MS = 2000;

type Props = StackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ navigation, route }: Props) {
  const { match } = route.params;
  const recipientId = match.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [inputText, setInputText] = useState('');
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const { showToast } = useToast();

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!isTypingRef.current) {
      return;
    }

    isTypingRef.current = false;
    socketRef.current?.emit('typing', { recipientId, isTyping: false });
  }, [recipientId]);

  useEffect(() => {
    let isActive = true;

    const handleNewMessage = (event: NewMessageEvent) => {
      const message = mapMessage(event.message);

      // The server only emits into this conversation's room, but guard anyway
      // so a stale subscription can never leak another chat into this one.
      if (message.senderId !== recipientId && message.receiverId !== recipientId) {
        return;
      }

      setMessages((previous) =>
        previous.some((existing) => existing.id === message.id)
          ? previous
          : [...previous, message]
      );

      // The screen is open, so anything arriving from them has been seen.
      if (message.senderId === recipientId) {
        socketRef.current?.emit('mark_read', { recipientId });
      }
    };

    const handleMessagesRead = (event: MessagesReadEvent) => {
      if (event.readBy !== recipientId) {
        return;
      }

      setMessages((previous) =>
        previous.map((message) =>
          message.senderId === recipientId || message.isRead
            ? message
            : { ...message, isRead: true }
        )
      );
    };

    const handlePresence = (event: PresenceEvent) => {
      if (event.userId !== recipientId) {
        return;
      }

      setIsRecipientOnline(event.isOnline);

      // Someone who just went offline cannot still be typing.
      if (!event.isOnline) {
        setIsRecipientTyping(false);
      }
    };

    const handleUserTyping = (event: UserTypingEvent) => {
      if (event.userId !== recipientId) {
        return;
      }

      setIsRecipientTyping(event.isTyping);
    };

    const handleSocketError = (payload: { message?: string }) => {
      showToast({
        type: 'error',
        title: 'Chat error',
        message: payload?.message || 'Something went wrong.',
      });
    };

    const setup = async () => {
      try {
        const [userId, history] = await Promise.all([getStoredUserId(), getMessages(recipientId)]);

        if (!isActive) return;

        setCurrentUserId(userId || '');
        setMessages(history);
        setLoadError('');
      } catch (error) {
        if (!isActive) return;

        setLoadError(error instanceof Error ? error.message : 'Failed to load messages.');
        return;
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }

      try {
        const socket = await getSocket();

        if (!isActive) {
          return;
        }

        socketRef.current = socket;

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('messages_read', handleMessagesRead);
        socket.on('presence_changed', handlePresence);
        socket.on('error', handleSocketError);

        socket.emit('join_conversation', recipientId);
        socket.emit('mark_read', { recipientId });
      } catch (_error) {
        if (!isActive) return;

        showToast({
          type: 'error',
          title: 'Not connected',
          message: 'Live messages are unavailable. Reopen the chat to retry.',
        });
      }
    };

    setup();

    return () => {
      isActive = false;

      const socket = socketRef.current;

      if (socket) {
        socket.emit('leave_conversation', recipientId);
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
        socket.off('messages_read', handleMessagesRead);
        socket.off('presence_changed', handlePresence);
        socket.off('error', handleSocketError);
        socketRef.current = null;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      isTypingRef.current = false;
    };
  }, [recipientId, showToast]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleInputChange = (text: string) => {
    setInputText(text);

    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    // Emit once on the first keystroke rather than on every one.
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { recipientId, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  };

  const sendMessage = () => {
    const content = inputText.trim();

    if (!content) {
      return;
    }

    const socket = socketRef.current;

    if (!socket) {
      showToast({
        type: 'error',
        title: 'Not connected',
        message: 'Reopen the chat and try again.',
      });
      return;
    }

    // The server echoes the saved message back into this conversation's room,
    // so the sender's own copy arrives through `new_message` like any other.
    socket.emit('send_message', { recipientId, content });
    setInputText('');
    stopTyping();
  };

  const formatTime = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

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

  const renderMessage = ({ item }: { item: ChatMessage }) => {
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
            {item.content}
          </Text>
        </View>
        <View style={styles.messageMeta}>
          <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
          {isOwnMessage && (
            <Ionicons
              name={item.isRead ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={item.isRead ? COLORS.primary : COLORS.textLight}
            />
          )}
        </View>
      </View>
    );
  };

  const renderMessageList = () => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.stateContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.textLight} />
          <Text style={styles.stateText}>{loadError}</Text>
        </View>
      );
    }

    if (messages.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>You matched with {match.name}. Say hello!</Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />
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
          {isRecipientTyping ? (
            <Text style={styles.typingText}>typing...</Text>
          ) : (
            <View style={styles.onlineIndicator}>
              <View style={[styles.onlineDot, !isRecipientOnline && styles.offlineDot]} />
              <Text style={[styles.onlineText, !isRecipientOnline && styles.offlineText]}>
                {isRecipientOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowActionsMenu(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {renderMessageList()}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textLight}
            value={inputText}
            onChangeText={handleInputChange}
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
  offlineDot: {
    backgroundColor: COLORS.textLight,
  },
  offlineText: {
    color: COLORS.textLight,
  },
  typingText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
    gap: 12,
  },
  stateText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
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
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
