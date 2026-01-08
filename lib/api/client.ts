  import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError, ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_PREFIX = '/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_PREFIX}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token and tenant header
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add tenant header if tenantSlug is in URL or config
        const tenantSlug = this.getTenantSlug();
        if (tenantSlug) {
          config.headers['x-tenant-slug'] = tenantSlug;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 - Refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - logout user
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('refreshToken');
  }

  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('accessToken', token);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('tenantSlug');
    sessionStorage.removeItem('userRole');
  }

  private getTenantSlug(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('tenantSlug');
  }

  public setTenantSlug(tenantSlug: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('tenantSlug', tenantSlug);
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple refresh calls
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const response = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${API_BASE_URL}${API_PREFIX}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = response.data.data.accessToken;
        this.setAccessToken(newAccessToken);
        return newAccessToken;
      } catch (error) {
        this.clearTokens();
        return null;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ) {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ) {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ) {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: InternalAxiosRequestConfig) {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

