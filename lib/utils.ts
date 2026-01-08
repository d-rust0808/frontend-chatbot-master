import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AxiosError } from 'axios';
import type { ApiError } from './api/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data?.error?.message) {
      return axiosError.response.data.error.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Có lỗi xảy ra';
}

