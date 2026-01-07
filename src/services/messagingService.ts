/**
 * Messaging Service
 * Handles all messaging-related API calls
 */

import api, { ApiResponse, handleApiError } from './api';

/**
 * Messaging Types
 */
export type MessageType = 'text' | 'image' | 'system';

export interface Message {
  id: number;
  conversation: number;
  sender: number;
  sender_name: string;
  sender_photo: string;
  text: string;
  message_type: MessageType;
  is_read: boolean;
  read_at?: string;
  is_mine: boolean;
  created_at: string;
  updated_at: string;
}

export interface OtherParticipant {
  id: number;
  display_name: string;
  profile_photo: string;
}

export interface Conversation {
  id: number;
  participant1: number;
  participant1_name: string;
  participant1_photo: string;
  participant2: number;
  participant2_name: string;
  participant2_photo: string;
  other_participant?: OtherParticipant;
  match?: number;
  is_active: boolean;
  last_message_text: string;
  last_message_at?: string;
  last_message_is_mine: boolean;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  recent_messages: Message[];
}

export interface SendMessageData {
  conversation_id: number;
  text: string;
  message_type?: MessageType;
}

export interface CreateConversationData {
  other_user_id: number;
  initial_message?: string;
}

/**
 * Messaging Service
 */
export const messagingService = {
  /**
   * Get all conversations for current user
   */
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    try {
      const response = await api.get('/messaging/conversations/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get a single conversation by ID with recent messages
   */
  async getConversation(conversationId: number): Promise<ApiResponse<ConversationDetail>> {
    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new conversation with another user
   */
  async createConversation(data: CreateConversationData): Promise<ApiResponse<ConversationDetail>> {
    try {
      const response = await api.post('/messaging/conversations/', data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark all messages in a conversation as read
   */
  async markConversationAsRead(conversationId: number): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await api.post(`/messaging/conversations/${conversationId}/mark_as_read/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get total unread message count
   */
  async getUnreadCount(): Promise<ApiResponse<{ unread_count: number }>> {
    try {
      const response = await api.get('/messaging/conversations/unread_count/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: number): Promise<ApiResponse<Message[]>> {
    try {
      const response = await api.get(`/messaging/messages/?conversation=${conversationId}`);

      // Handle paginated response
      let messages: Message[] = [];
      if (Array.isArray(response.data)) {
        messages = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        messages = response.data.results;
      }

      // Reverse to show oldest first (API returns newest first)
      messages.reverse();

      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Send a message
   */
  async sendMessage(data: SendMessageData): Promise<ApiResponse<Message>> {
    try {
      const response = await api.post('/messaging/messages/send/', data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark a specific message as read
   */
  async markMessageAsRead(messageId: number): Promise<ApiResponse<void>> {
    try {
      await api.post(`/messaging/messages/${messageId}/mark_read/`);

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/messaging/messages/${messageId}/`);

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Start a conversation with a matched user
   * Convenience method that creates conversation if it doesn't exist
   */
  async startConversationWithUser(
    userId: number,
    initialMessage?: string
  ): Promise<ApiResponse<ConversationDetail>> {
    try {
      const response = await this.createConversation({
        other_user_id: userId,
        initial_message: initialMessage,
      });

      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default messagingService;
