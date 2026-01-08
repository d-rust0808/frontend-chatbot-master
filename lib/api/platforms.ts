import { apiClient } from './client';
import type {
  ApiResponse,
  PlatformConnection,
  ConnectPlatformRequest,
} from './types';

export async function getConnections(
  chatbotId?: string
): Promise<ApiResponse<PlatformConnection[]>> {
  const params = chatbotId ? { chatbotId } : undefined;
  return apiClient.get('/platforms/connections', params ? { params } : undefined);
}

export async function connectPlatform(
  data: ConnectPlatformRequest
): Promise<ApiResponse<PlatformConnection>> {
  return apiClient.post('/platforms/connect', data);
}

export async function disconnectPlatform(
  connectionId: string
): Promise<ApiResponse<void>> {
  return apiClient.delete(`/platforms/${connectionId}/disconnect`);
}

export interface SendMessageRequest {
  connectionId: string;
  chatId: string;
  message: string;
  useQueue?: boolean;
  options?: {
    mediaUrl?: string;
    mediaType?: string;
  };
}

export async function sendMessage(
  data: SendMessageRequest
): Promise<ApiResponse<void>> {
  return apiClient.post('/platforms/send-message', data);
}

