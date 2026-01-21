  import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError, ApiErrorResponse, ApiResponse } from './types';
import { ApiErrorException } from './types';

const API_BASE_URL = 'https://cchatbot.pro';
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
      withCredentials: false,
      timeout: 30000,
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

        // If data is FormData, remove Content-Type header to let axios set it automatically with boundary
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
          // Ensure FormData requests work with CORS
          config.headers['Accept'] = 'application/json';
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle new format and 401 refresh token
    this.client.interceptors.response.use(
      (response) => {
        // Backend trả về format mới (2024): { status, message, data, api_version, provider, meta? }
        // Note: Field order changed but object key access remains the same
        
        // Kiểm tra response.data có tồn tại và là object
        if (!response.data || typeof response.data !== 'object') {
          // Fallback: trả về response như cũ (backward compatibility)
          return response;
        }

        const responseData = response.data as ApiResponse<unknown> | ApiErrorResponse;

        // Kiểm tra nếu là error response (có error field và status >= 400)
        if (
          'error' in responseData &&
          'status' in responseData &&
          typeof responseData.status === 'number' &&
          responseData.status >= 400
        ) {
          // Convert to ApiErrorException và reject
          throw ApiErrorException.fromResponse(responseData as ApiErrorResponse);
        }

        // Kiểm tra status trong response body (không chỉ HTTP status code)
        if ('status' in responseData && typeof responseData.status === 'number') {
          if (responseData.status >= 200 && responseData.status < 300) {
            // Success - tạo plain object copy để đảm bảo serialization an toàn
            // Spread responseData để tạo shallow copy, đảm bảo không có non-serializable properties
            const plainData = { ...responseData } as ApiResponse<unknown>;
            // Giữ nguyên axios response structure nhưng với plain data
            return Object.assign(response, { data: plainData });
          } else {
            // Error status trong body - convert to ApiErrorException
            throw ApiErrorException.fromResponse(responseData as ApiErrorResponse);
          }
        }

        // Fallback: trả về response như cũ (backward compatibility)
        return response;
      },
      async (error: AxiosError<ApiErrorResponse | ApiError>) => {
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

        // Handle error response với format mới
        if (error.response?.data) {
          const errorData = error.response.data;
          // Check if it's new format
          if ('error' in errorData && 'status' in errorData) {
            return Promise.reject(
              ApiErrorException.fromResponse(errorData as ApiErrorResponse)
            );
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
        // Note: Using axios.post directly (bypasses interceptor) to avoid infinite loop
        // Backend returns new format: { status, message, data, api_version, provider }
        const response = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${API_BASE_URL}${API_PREFIX}/auth/refresh`,
          { refreshToken }
        );

        const responseData = response.data;
        
        // Check status in response body (new format)
        if (responseData.status >= 200 && responseData.status < 300) {
          const newAccessToken = responseData.data.accessToken;
          this.setAccessToken(newAccessToken);
          return newAccessToken;
        } else {
          // Error status - clear tokens and return null
          this.clearTokens();
          return null;
        }
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

