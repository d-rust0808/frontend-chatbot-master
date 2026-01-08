import { apiClient } from './client';
import type {
  ApiResponse,
  Conversation,
  Message,
} from './types';

export interface GetConversationsParams {
  chatbotId?: string;
  platform?: string;
  status?: 'active' | 'closed';
  page?: number;
  limit?: number;
}

export async function getConversations(
  params?: GetConversationsParams
): Promise<ApiResponse<Conversation[]>> {
  return apiClient.get('/conversations', params ? { params } : undefined);
}

export async function getConversation(
  conversationId: string
): Promise<ApiResponse<Conversation>> {
  return apiClient.get(`/conversations/${conversationId}`);
}

export async function getMessages(
  conversationId: string
): Promise<ApiResponse<Message[]>> {
  return apiClient.get(`/conversations/${conversationId}/messages`);
}

