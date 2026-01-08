import { apiClient } from './client';
import type {
  ApiResponse,
  Chatbot,
  CreateChatbotRequest,
  GetChatbotsParams,
  UpdateChatbotRequest,
} from './types';

export async function getChatbots(
  params?: GetChatbotsParams
): Promise<ApiResponse<Chatbot[]>> {
  return apiClient.get<Chatbot[]>('/chatbots', params ? { params } : undefined);
}

export async function getChatbot(
  chatbotId: string
): Promise<ApiResponse<Chatbot>> {
  return apiClient.get(`/chatbots/${chatbotId}`);
}

export async function createChatbot(
  data: CreateChatbotRequest
): Promise<ApiResponse<Chatbot>> {
  return apiClient.post('/chatbots', data);
}

export async function updateChatbot(
  chatbotId: string,
  data: UpdateChatbotRequest
): Promise<ApiResponse<Chatbot>> {
  return apiClient.patch(`/chatbots/${chatbotId}`, data);
}

export async function getModels(): Promise<
  ApiResponse<{ recommended: string[]; all: string[] }>
> {
  return apiClient.get('/chatbots/models');
}

