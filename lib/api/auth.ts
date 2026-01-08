import { apiClient } from './client';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from './types';

export async function login(
  data: LoginRequest
): Promise<ApiResponse<AuthResponse>> {
  return apiClient.post('/auth/login', data);
}

export async function register(
  data: RegisterRequest
): Promise<ApiResponse<AuthResponse>> {
  return apiClient.post('/auth/register', data);
}

export async function logout(): Promise<ApiResponse<void>> {
  return apiClient.post('/auth/logout');
}

