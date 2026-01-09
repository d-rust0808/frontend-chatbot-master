import { apiClient } from './client';
import type {
  ApiResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  Payment,
  PaymentStatusResponse,
  GetPaymentsParams,
  CancelPaymentResponse,
  VNDBalance,
  GetVNDTransactionsParams,
  VNDTransactionsResponse,
  AllBalancesResponse,
} from './types';

export async function createPayment(
  data: CreatePaymentRequest
): Promise<ApiResponse<CreatePaymentResponse>> {
  return apiClient.post('/admin/payments', data);
}

export async function getPendingPayment(): Promise<ApiResponse<Payment>> {
  return apiClient.get('/admin/payments/pending');
}

export async function cancelPendingPayment(): Promise<ApiResponse<CancelPaymentResponse>> {
  return apiClient.delete('/admin/payments/pending');
}

export async function getPaymentStatus(
  code: string
): Promise<ApiResponse<PaymentStatusResponse>> {
  return apiClient.get(`/admin/payments/status/${code}`);
}

export async function getPayments(
  params?: GetPaymentsParams
): Promise<ApiResponse<Payment[]>> {
  return apiClient.get('/admin/payments', params ? { params } : undefined);
}

export async function getVNDBalance(): Promise<ApiResponse<VNDBalance>> {
  return apiClient.get('/credits/vnd-balance');
}

export async function getVNDTransactions(
  params?: GetVNDTransactionsParams
): Promise<ApiResponse<VNDTransactionsResponse>> {
  return apiClient.get('/credits/vnd-transactions', params ? { params } : undefined);
}

export async function getPaymentById(
  paymentId: string
): Promise<ApiResponse<Payment>> {
  return apiClient.get(`/admin/payments/${paymentId}`);
}

export async function getAllBalances(): Promise<ApiResponse<AllBalancesResponse>> {
  return apiClient.get('/credits/balances');
}

