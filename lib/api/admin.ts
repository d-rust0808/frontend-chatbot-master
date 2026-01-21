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
  BalanceLog,
  SystemConfig,
  SystemConfigDetailResponse,
  CreateSystemConfigRequest,
  UpdateSystemConfigRequest,
  GetSystemConfigsParams,
  InitializeSystemConfigsResponse,
  AIModelConfig,
  CreateAIModelRequest,
  UpdateAIModelRequest,
  AIRequestLog,
  GetAILogsParams,
  AILogsSuspiciousIP,
  GetAILogsSuspiciousIPsParams,
  ProxyBalance,
  IPEntry,
  CreateIPEntryRequest,
  GetIPEntriesParams,
  ToggleIPEntryRequest,
  AccessLog,
  GetAccessLogsParams,
  SuspiciousIP as AccessLogSuspiciousIP,
  GetSuspiciousIPsParams as GetAccessLogSuspiciousIPsParams,
  IPDetails,
  GetIPDetailsParams,
  BanIPFromSuspiciousRequest,
  AnalyticsOverview,
  GetAnalyticsOverviewParams,
  GrowthAnalytics,
  GetGrowthAnalyticsParams,
  RevenueAnalytics,
  GetRevenueAnalyticsParams,
  AIUsageAnalytics,
  GetAIUsageAnalyticsParams,
  PlatformAnalytics,
  GetPlatformAnalyticsParams,
  TopListAnalytics,
  GetTopListAnalyticsParams,
  SystemHealthAnalytics,
  GetSystemHealthAnalyticsParams,
} from './types';

// SP-Admin stats endpoint
export async function getAdminStats(): Promise<ApiResponse<AdminStats>> {
  return apiClient.get('/sp-admin/stats');
}

// Admin role stats endpoint (different from SP-Admin)
export async function getAdminDashboardStats(): Promise<ApiResponse<AdminStats>> {
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
  return apiClient.get('/sp-admin/users', params ? { params } : undefined);
}

export interface GetTenantsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getTenants(
  params?: GetTenantsParams
): Promise<ApiResponse<Tenant[]>> {
  return apiClient.get('/sp-admin/tenants', params ? { params } : undefined);
}

export async function getTenantDetail(
  tenantId: string
): Promise<ApiResponse<Tenant>> {
  return apiClient.get(`/sp-admin/tenants/${tenantId}`);
}

export async function createCustomer(
  data: CreateCustomerRequest
): Promise<ApiResponse<CreateCustomerResponse>> {
  return apiClient.post('/sp-admin/customers', data);
}

export async function updateTenant(
  tenantId: string,
  data: UpdateTenantRequest
): Promise<ApiResponse<Tenant>> {
  return apiClient.patch(`/sp-admin/tenants/${tenantId}`, data);
}

export async function getTenantAdmins(
  tenantId: string
): Promise<ApiResponse<TenantAdmin[]>> {
  return apiClient.get('/sp-admin/tenant-admins', { params: { tenantId } });
}

export async function createTenantAdmin(
  data: CreateTenantAdminRequest
): Promise<ApiResponse<CreateTenantAdminResponse>> {
  return apiClient.post('/sp-admin/tenant-admins', data);
}

export async function updateTenantAdmin(
  userId: string,
  data: UpdateTenantAdminRequest
): Promise<ApiResponse<void>> {
  return apiClient.patch(`/sp-admin/tenant-admins/${userId}`, data);
}

export async function deleteTenantAdmin(
  userId: string,
  tenantId?: string
): Promise<ApiResponse<void>> {
  const url = tenantId
    ? `/sp-admin/tenant-admins/${userId}?tenantId=${tenantId}`
    : `/sp-admin/tenant-admins/${userId}`;
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
  return apiClient.post(`/sp-admin/users/${userId}/top-up`, data);
}

export interface GetAdminBalanceLogsParams {
  page?: number;
  limit?: number;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  type?: 'vnd' | 'credit' | 'all';
}

export async function getAdminBalanceLogs(
  adminId: string,
  params?: GetAdminBalanceLogsParams
): Promise<ApiResponse<BalanceLog[]>> {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.type) queryParams.type = params.type;

  return apiClient.get(
    `/sp-admin/users/${adminId}/balance-logs`,
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export interface GetAllAdminBalanceLogsParams {
  page?: number;
  limit?: number;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  type?: 'vnd' | 'credit' | 'all';
  adminId?: string; // Optional filter by adminId
}

export async function getAllAdminBalanceLogs(
  params?: GetAllAdminBalanceLogsParams
): Promise<ApiResponse<BalanceLog[]>> {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.type) queryParams.type = params.type;
  if (params?.adminId) queryParams.adminId = params.adminId;

  return apiClient.get(
    '/sp-admin/balance-logs',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

// System Config API Functions
export async function getSystemConfigs(
  params?: GetSystemConfigsParams
): Promise<ApiResponse<SystemConfig[]>> {
  const queryParams: Record<string, string> = {};
  if (params?.category) queryParams.category = params.category;
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.search) queryParams.search = params.search;

  return apiClient.get<SystemConfig[]>(
    '/sp-admin/system-configs',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function getSystemConfig(
  category: string,
  key: string
): Promise<SystemConfigDetailResponse> {
  return apiClient.get(`/sp-admin/system-configs/${category}/${key}`);
}

export async function createSystemConfig(
  data: CreateSystemConfigRequest
): Promise<ApiResponse<SystemConfig>> {
  return apiClient.post('/sp-admin/system-configs', data);
}

export async function updateSystemConfig(
  category: string,
  key: string,
  data: UpdateSystemConfigRequest
): Promise<ApiResponse<SystemConfig>> {
  return apiClient.patch(`/sp-admin/system-configs/${category}/${key}`, data);
}

export async function deleteSystemConfig(
  category: string,
  key: string
): Promise<ApiResponse<void>> {
  return apiClient.delete(`/sp-admin/system-configs/${category}/${key}`);
}

export async function initializeSystemConfigs(): Promise<
  ApiResponse<InitializeSystemConfigsResponse>
> {
  return apiClient.post('/sp-admin/system-configs/initialize');
}

// AI Models API Functions
export async function getAIModels(): Promise<ApiResponse<AIModelConfig[]>> {
  return apiClient.get('/sp-admin/ai-models');
}

export async function getAIModel(name: string): Promise<ApiResponse<AIModelConfig>> {
  return apiClient.get(`/sp-admin/ai-models/${name}`);
}

export async function createAIModel(
  data: CreateAIModelRequest
): Promise<ApiResponse<AIModelConfig>> {
  return apiClient.post('/sp-admin/ai-models', data);
}

export async function updateAIModel(
  name: string,
  data: UpdateAIModelRequest
): Promise<ApiResponse<AIModelConfig>> {
  return apiClient.patch(`/sp-admin/ai-models/${name}`, data);
}

export async function deleteAIModel(name: string): Promise<ApiResponse<void>> {
  return apiClient.delete(`/sp-admin/ai-models/${name}`);
}

// AI Logs API Functions
export async function getAILogs(
  params?: GetAILogsParams
): Promise<ApiResponse<AIRequestLog[]>> {
  const queryParams: Record<string, string> = {};
  if (params?.tenantId) queryParams.tenantId = params.tenantId;
  if (params?.provider) queryParams.provider = params.provider;
  if (params?.model) queryParams.model = params.model;
  if (params?.ipAddress) queryParams.ipAddress = params.ipAddress;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();

  return apiClient.get<AIRequestLog[]>(
    '/sp-admin/ai-logs',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function getSuspiciousIPs(
  params?: GetAILogsSuspiciousIPsParams
): Promise<ApiResponse<AILogsSuspiciousIP[]>> {
  const queryParams: Record<string, string> = {};
  if (params?.threshold) queryParams.threshold = params.threshold.toString();
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  return apiClient.get<AILogsSuspiciousIP[]>(
    '/sp-admin/ai-logs/suspicious-ips',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

// Proxy Balance API Functions
export async function getProxyBalance(): Promise<ApiResponse<ProxyBalance>> {
  return apiClient.get<ProxyBalance>('/sp-admin/ai/balance');
}

// IP Management API Functions
export async function getBlacklist(
  params?: GetIPEntriesParams
): Promise<ApiResponse<IPEntry[]>> {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.isActive !== undefined) queryParams.isActive = params.isActive.toString();

  return apiClient.get<IPEntry[]>(
    '/sp-admin/ip-management/blacklist',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function addToBlacklist(
  data: CreateIPEntryRequest
): Promise<ApiResponse<IPEntry>> {
  return apiClient.post<IPEntry>('/sp-admin/ip-management/blacklist', data);
}

export async function removeFromBlacklist(
  ipAddress: string
): Promise<ApiResponse<{ message: string }>> {
  const encodedIP = encodeURIComponent(ipAddress);
  return apiClient.delete<{ message: string }>(
    `/sp-admin/ip-management/blacklist/${encodedIP}`
  );
}

export async function toggleBlacklistStatus(
  ipAddress: string,
  data: ToggleIPEntryRequest
): Promise<ApiResponse<{ message: string }>> {
  const encodedIP = encodeURIComponent(ipAddress);
  return apiClient.patch<{ message: string }>(
    `/sp-admin/ip-management/blacklist/${encodedIP}/toggle`,
    data
  );
}

export async function getWhitelist(
  params?: GetIPEntriesParams
): Promise<ApiResponse<IPEntry[]>> {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.isActive !== undefined) queryParams.isActive = params.isActive.toString();

  return apiClient.get<IPEntry[]>(
    '/sp-admin/ip-management/whitelist',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function addToWhitelist(
  data: CreateIPEntryRequest
): Promise<ApiResponse<IPEntry>> {
  return apiClient.post<IPEntry>('/sp-admin/ip-management/whitelist', data);
}

export async function removeFromWhitelist(
  ipAddress: string
): Promise<ApiResponse<{ message: string }>> {
  const encodedIP = encodeURIComponent(ipAddress);
  return apiClient.delete<{ message: string }>(
    `/sp-admin/ip-management/whitelist/${encodedIP}`
  );
}

export async function toggleWhitelistStatus(
  ipAddress: string,
  data: ToggleIPEntryRequest
): Promise<ApiResponse<{ message: string }>> {
  const encodedIP = encodeURIComponent(ipAddress);
  return apiClient.patch<{ message: string }>(
    `/sp-admin/ip-management/whitelist/${encodedIP}/toggle`,
    data
  );
}

// Ban/Unban Alias APIs
export async function banIP(
  data: CreateIPEntryRequest
): Promise<ApiResponse<IPEntry>> {
  return apiClient.post<IPEntry>('/sp-admin/ip-management/ban', data);
}

export async function unbanIP(
  ipAddress: string
): Promise<ApiResponse<{ message: string }>> {
  const encodedIP = encodeURIComponent(ipAddress);
  return apiClient.delete<{ message: string }>(
    `/sp-admin/ip-management/ban/${encodedIP}`
  );
}

// IP Access Logs API Functions
export async function getAccessLogs(
  params?: GetAccessLogsParams
): Promise<ApiResponse<AccessLog[]>> {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.ipAddress) queryParams.ipAddress = params.ipAddress;
  if (params?.tenantId) queryParams.tenantId = params.tenantId;
  if (params?.userId) queryParams.userId = params.userId;
  if (params?.method) queryParams.method = params.method;
  if (params?.path) queryParams.path = params.path;
  if (params?.statusCode) queryParams.statusCode = params.statusCode.toString();
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  return apiClient.get<AccessLog[]>(
    '/sp-admin/access-logs',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function getAccessLogSuspiciousIPs(
  params?: GetAccessLogSuspiciousIPsParams
): Promise<ApiResponse<AccessLogSuspiciousIP[]>> {
  const queryParams: Record<string, string> = {};
  if (params?.minRiskScore) queryParams.minRiskScore = params.minRiskScore.toString();
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  return apiClient.get<AccessLogSuspiciousIP[]>(
    '/sp-admin/access-logs/suspicious',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function getIPDetails(
  ipAddress: string,
  params?: GetIPDetailsParams
): Promise<ApiResponse<IPDetails>> {
  const encodedIP = encodeURIComponent(ipAddress);
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  return apiClient.get<IPDetails>(
    `/sp-admin/access-logs/ip/${encodedIP}`,
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function banIPFromSuspicious(
  ipAddress: string,
  data: BanIPFromSuspiciousRequest
): Promise<ApiResponse<IPEntry>> {
  const encodedIP = encodeURIComponent(ipAddress);
  return apiClient.post<IPEntry>(`/sp-admin/access-logs/ip/${encodedIP}/ban`, data);
}

// Analytics API Functions
export async function getAnalyticsOverview(
  params?: GetAnalyticsOverviewParams
): Promise<ApiResponse<AnalyticsOverview>> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.period) queryParams.period = params.period;
  if (params?.compareWithPrevious !== undefined) {
    queryParams.compareWithPrevious = params.compareWithPrevious.toString();
  }

  return apiClient.get<AnalyticsOverview>(
    '/sp-admin/analytics/overview',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function getGrowthAnalytics(
  params: GetGrowthAnalyticsParams
): Promise<ApiResponse<GrowthAnalytics>> {
  const queryParams: Record<string, string> = {
    startDate: params.startDate,
    endDate: params.endDate,
    metric: params.metric,
  };
  if (params.interval) queryParams.interval = params.interval;

  return apiClient.get<GrowthAnalytics>('/sp-admin/analytics/growth', {
    params: queryParams,
  });
}

export async function getRevenueAnalytics(
  params?: GetRevenueAnalyticsParams
): Promise<ApiResponse<RevenueAnalytics>> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.groupBy) queryParams.groupBy = params.groupBy;
  if (params?.limit) queryParams.limit = params.limit.toString();

  return apiClient.get<RevenueAnalytics>(
    '/sp-admin/analytics/revenue',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function getAIUsageAnalytics(
  params?: GetAIUsageAnalyticsParams
): Promise<ApiResponse<AIUsageAnalytics>> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.groupBy) queryParams.groupBy = params.groupBy;
  if (params?.tenantId) queryParams.tenantId = params.tenantId;

  return apiClient.get<AIUsageAnalytics>(
    '/sp-admin/analytics/ai-usage',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function getPlatformAnalytics(
  params?: GetPlatformAnalyticsParams
): Promise<ApiResponse<PlatformAnalytics>> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.metric) queryParams.metric = params.metric;

  return apiClient.get<PlatformAnalytics>(
    '/sp-admin/analytics/platforms',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

export async function getTopListAnalytics(
  params: GetTopListAnalyticsParams
): Promise<ApiResponse<TopListAnalytics>> {
  const queryParams: Record<string, string> = {
    type: params.type,
    metric: params.metric,
  };
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;
  if (params.limit) queryParams.limit = params.limit.toString();

  return apiClient.get<TopListAnalytics>('/sp-admin/analytics/top', {
    params: queryParams,
  });
}

export async function getSystemHealthAnalytics(
  params?: GetSystemHealthAnalyticsParams
): Promise<ApiResponse<SystemHealthAnalytics>> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.interval) queryParams.interval = params.interval;

  return apiClient.get<SystemHealthAnalytics>(
    '/sp-admin/analytics/health',
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
  );
}

