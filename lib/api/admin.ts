import { apiClient } from './client';
import type {
  ApiResponse,
  AdminStats,
  User,
  Tenant,
  CreateCustomerRequest,
  CreateCustomerResponse,
  UpdateTenantRequest,
  TenantAdmin,
  CreateTenantAdminRequest,
  CreateTenantAdminResponse,
  UpdateTenantAdminRequest,
  CancelPaymentResponse,
} from './types';

export async function getAdminStats(): Promise<ApiResponse<AdminStats>> {
  return apiClient.get('/admin/stats');
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getUsers(
  params?: GetUsersParams
): Promise<ApiResponse<User[]>> {
  return apiClient.get('/admin/users', params ? { params } : undefined);
}

export interface GetTenantsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getTenants(
  params?: GetTenantsParams
): Promise<ApiResponse<Tenant[]>> {
  return apiClient.get('/admin/tenants', params ? { params } : undefined);
}

export async function getTenantDetail(
  tenantId: string
): Promise<ApiResponse<Tenant>> {
  return apiClient.get(`/admin/tenants/${tenantId}`);
}

export async function createCustomer(
  data: CreateCustomerRequest
): Promise<ApiResponse<CreateCustomerResponse>> {
  return apiClient.post('/admin/customers', data);
}

export async function updateTenant(
  tenantId: string,
  data: UpdateTenantRequest
): Promise<ApiResponse<Tenant>> {
  return apiClient.patch(`/admin/tenants/${tenantId}`, data);
}

export async function getTenantAdmins(
  tenantId: string
): Promise<ApiResponse<TenantAdmin[]>> {
  return apiClient.get('/admin/tenant-admins', { params: { tenantId } });
}

export async function createTenantAdmin(
  data: CreateTenantAdminRequest
): Promise<ApiResponse<CreateTenantAdminResponse>> {
  return apiClient.post('/admin/tenant-admins', data);
}

export async function updateTenantAdmin(
  userId: string,
  data: UpdateTenantAdminRequest
): Promise<ApiResponse<void>> {
  return apiClient.patch(`/admin/tenant-admins/${userId}`, data);
}

export async function deleteTenantAdmin(
  userId: string,
  tenantId?: string
): Promise<ApiResponse<void>> {
  const url = tenantId
    ? `/admin/tenant-admins/${userId}?tenantId=${tenantId}`
    : `/admin/tenant-admins/${userId}`;
  return apiClient.delete(url);
}

export async function cancelPayment(
  paymentId: string
): Promise<ApiResponse<CancelPaymentResponse>> {
  return apiClient.delete(`/admin/payments/${paymentId}`);
}

export interface TopUpUserBalanceRequest {
  vndAmount?: number;
  creditAmount?: number;
  reason?: string;
}

export interface TopUpUserBalanceResponse {
  userId: string;
  tenantId: string;
  tenantName: string;
  vndAmount: number;
  creditAmount: number;
  newBalance: number;
  newCredit: number;
}

export async function topUpUserBalance(
  userId: string,
  data: TopUpUserBalanceRequest
): Promise<ApiResponse<TopUpUserBalanceResponse>> {
  return apiClient.post(`/admin/users/${userId}/top-up`, data);
}

