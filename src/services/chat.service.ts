import { API_PATHS } from '../config/api';
import { authorizedRequest } from './http';

export type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

// Mongoose serializes documents with `_id`, so the wire shape differs from
// what the screen renders.
type ApiMessage = {
  _id?: string;
  id?: string;
  senderId?: string;
  receiverId?: string;
  content?: string;
  isRead?: boolean;
  createdAt?: string;
};

type GetMessagesResponse = {
  messages?: ApiMessage[];
};

type ApiConversation = {
  conversationId?: string;
  otherUser?: { _id?: string; fullName?: string } | null;
  lastMessage?: ApiMessage;
  unreadCount?: number;
};

type GetConversationsResponse = {
  conversations?: ApiConversation[];
};

export type Conversation = {
  otherUserId: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
};

// Socket payloads, mirroring the server's events in src/socket/chat.socket.ts.
export type NewMessageEvent = {
  conversationId: string;
  message: ApiMessage;
};

export type UserTypingEvent = {
  userId: string;
  isTyping: boolean;
};

export type MessagesReadEvent = {
  conversationId: string;
  readBy: string;
};

export type PresenceEvent = {
  userId: string;
  isOnline: boolean;
};

export const mapMessage = (message: ApiMessage): ChatMessage => ({
  id: message._id || message.id || '',
  senderId: message.senderId || '',
  receiverId: message.receiverId || '',
  content: message.content || '',
  isRead: message.isRead ?? false,
  createdAt: message.createdAt || new Date().toISOString(),
});

export const getMessages = async (
  recipientId: string,
  options?: { page?: number; limit?: number }
): Promise<ChatMessage[]> => {
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    limit: String(options?.limit ?? 50),
  });

  const response = await authorizedRequest<GetMessagesResponse>(
    `${API_PATHS.chatBase}/${recipientId}?${params.toString()}`,
    { method: 'GET' }
  );

  // The API already returns oldest-first.
  return (response.messages || []).map(mapMessage).filter((message) => !!message.id);
};

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await authorizedRequest<GetConversationsResponse>(API_PATHS.chatBase, {
    method: 'GET',
  });

  return (response.conversations || [])
    .map((conversation) => ({
      otherUserId: conversation.otherUser?._id || '',
      lastMessage: conversation.lastMessage ? mapMessage(conversation.lastMessage) : null,
      unreadCount: conversation.unreadCount ?? 0,
    }))
    .filter((conversation) => !!conversation.otherUserId);
};
