// Common API Types
// New format (2024): { status, message, data, api_version, provider, meta? }
// Note: Field order changed but object key access remains the same
export interface ApiResponse<T> {
  status: number; // HTTP status code (200, 201, etc.) - ĐỨNG ĐẦU
  message: string; // Success message - THỨ HAI
  data: T; // Dữ liệu chính - THỨ BA
  api_version: string; // "v1"
  provider: string; // "cdudu"
  meta?: PaginationMeta | Record<string, unknown>; // Optional metadata
}

// Type guard to check if meta is PaginationMeta
export function isPaginationMeta(meta: unknown): meta is PaginationMeta {
  return (
    typeof meta === 'object' &&
    meta !== null &&
    'page' in meta &&
    'limit' in meta &&
    'total' in meta &&
    'totalPages' in meta
  );
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  filter?: Record<string, unknown>; // Optional filter info
}

// Error Response Format: { status, message, error: { code, details?, requestId? }, api_version, provider }
export interface ApiErrorResponse {
  status: number; // HTTP status code (400, 401, 404, 500, etc.)
  message: string; // User-friendly error message
  error: {
    code: string; // Error code (VALIDATION_ERROR, NOT_FOUND, etc.)
    details?: unknown; // Error details (validation errors, etc.) - Optional
    requestId?: string; // Request ID for tracking - Optional
  };
  api_version: string; // "v1"
  provider: string; // "cdudu"
}

// Legacy ApiError type for backward compatibility (deprecated)
export interface ApiError {
  error: {
    message: string;
    statusCode: number;
    details?: Array<{
      path: string[];
      message: string;
    }>;
  };
  api_version?: string;
  provider?: string;
}

// Custom ApiErrorException class for error handling
export class ApiErrorException extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public statusCode?: number,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApiErrorException';
    Object.setPrototypeOf(this, ApiErrorException.prototype);
  }

  static fromResponse(response: ApiErrorResponse): ApiErrorException {
    return new ApiErrorException(
      response.error.code,
      response.message,
      response.error.details,
      response.status,
      response.error.requestId
    );
  }
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface TenantMembership {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
}

export interface Wallet {
  vndBalance: number;
  creditBalance: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: SystemRole;
  };
  tenants?: TenantMembership[];
  wallet?: Wallet;
  subscriptions?: ServicePackageSubscriptionSummary[]; // Active service subscriptions
}

export type SystemRole =
  | 'sp-admin'
  | 'admin'
  | 'tenant-admin'
  | 'member'
  | 'user'
  | 'viewer'
  | 'unknown';

// Chatbot Types
export interface Chatbot {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  aiModel: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatbotRequest {
  name: string;
  description?: string;
  systemPrompt?: string;
  aiModel: string;
  temperature: number;
  maxTokens: number;
}

export interface UpdateChatbotRequest extends Partial<CreateChatbotRequest> {
  isActive?: boolean;
}

export interface GetChatbotsParams {
  page?: number;
  limit?: number;
}

// Platform Types
export interface PlatformConnection {
  id: string;
  chatbotId: string;
  chatbot?: Chatbot;
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt?: string;
  createdAt: string;
}

export interface ConnectPlatformRequest {
  chatbotId: string;
  platform: string;
  credentials: Record<string, unknown>;
  options?: Record<string, unknown>;
}

// Conversation Types
export interface Conversation {
  id: string;
  chatbotId: string;
  chatbot?: Chatbot;
  platform: string;
  chatId: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

// Admin Types
export interface AdminStats {
  users: { total: number };
  tenants: { total: number };
  chatbots: { total: number };
  conversations: { total: number };
  messages: { total: number };
  platformConnections: { active: number };
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  balance?: number;
  credit?: number;
  _count?: {
    tenants: number;
  };
}

export interface BalanceLog {
  id: string;
  type: 'vnd' | 'credit';
  amount: number;
  reason: string;
  tenant: {
    id: string;
    name: string;
  } | null;
  admin: {
    id: string;
    email: string;
    name: string;
  } | null;
  isPayment: boolean;
  isTopUp: boolean;
  paymentCode: string | null;
  createdAt: string;
  // Legacy fields for backward compatibility
  tenantId?: string;
  tenantName?: string;
  referenceId?: string | null;
  metadata?: {
    adminUserId: string;
    adminAction: boolean;
  };
}

export interface BalanceLogsMeta extends PaginationMeta {
  admin?: {
    id: string;
    email: string;
    name: string;
  };
  filter?: {
    adminId: string | null;
    type: 'vnd' | 'credit' | 'all';
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    chatbots: number;
    conversations: number;
  };
  users?: Array<{
    user: {
      id: string;
      email: string;
      name: string | null;
    };
    role: 'owner' | 'admin';
  }>;
  chatbots?: Array<{
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
  }>;
}

export interface CreateCustomerRequest {
  tenant: {
    name: string;
    slug: string;
  };
  adminUser: {
    email: string;
    password: string;
    name?: string;
  };
}

export interface CreateCustomerResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  adminUser: {
    id: string;
    email: string;
    name: string | null;
    role: SystemRole;
  };
}

export interface UpdateTenantRequest {
  name?: string;
  slug?: string;
  isActive?: boolean;
}

export interface TenantAdmin {
  userId: string;
  role: 'owner' | 'admin';
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    systemRole: SystemRole;
  };
}

export interface CreateTenantAdminRequest {
  tenantId: string;
  email: string;
  password: string;
  name?: string;
  role: 'owner' | 'admin';
}

export interface CreateTenantAdminResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: SystemRole;
  };
  tenantId: string;
  tenantRole: 'owner' | 'admin';
}

export interface UpdateTenantAdminRequest {
  name?: string;
  role?: 'owner' | 'admin';
}

// Payment Types
export type PaymentStatus = 'pending' | 'completed' | 'expired' | 'cancelled' | 'processing';

export interface PaymentInfo {
  account: string;
  bank: string;
  amount: number;
  content: string;
}

export interface CreatePaymentRequest {
  amount: number;
}

export interface CreatePaymentResponse {
  id: string;
  code: string;
  amount: number;
  qrCode: string;
  qrCodeData: string;
  expiresAt: string;
  paymentInfo: PaymentInfo;
}

export interface Payment {
  id: string;
  code: string;
  amount: number;
  status: PaymentStatus;
  qrCode?: string; // Optional, chỉ có khi pending hoặc trong CreatePaymentResponse
  qrCodeData?: string; // Optional, chỉ có trong CreatePaymentResponse
  expiresAt?: string; // Optional, chỉ có khi pending
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  webhookData: unknown | null;
  paymentInfo?: PaymentInfo; // Optional, có trong CreatePaymentResponse và pending payment
  timeRemaining?: number; // Frontend-only field for UI
}

export interface CancelPaymentResponse {
  id: string;
  code: string;
  status: PaymentStatus;
  cancelledAt: string;
}

export interface PaymentStatusResponse {
  code: string;
  status: PaymentStatus;
  amount: number;
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

export interface VNDBalance {
  balance: number;
  currency: string;
}

export interface VNDTransaction {
  id: string;
  amount: number;
  reason: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface GetVNDTransactionsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface VNDTransactionsResponse {
  transactions: VNDTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Wallet Balance Types
export interface Balances {
  vnd: number;
  credit: number;
}

export interface BalanceUpdateEvent {
  tenantId: string;
  balances: Balances;
  timestamp: string;
}

export interface AllBalancesResponse {
  balances: Balances;
  tenantId: string;
}

// Service Package Types

export type ServicePlatform =
  | 'whatsapp'
  | 'messenger'
  | 'tiktok'
  | 'zalo'
  | 'instagram'
  | 'shopee';

export interface ServicePackageFeatures {
  // Generic key-value store for feature limits (bots, messagesPerMonth, etc.)
  [key: string]: number | string | boolean | null;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string | null;
  service: ServicePlatform;
  pricePerMonth: number;
  minDuration: number;
  imageUrl?: string | null;
  features: ServicePackageFeatures;
  isActive?: boolean;
  sortOrder?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackageListItem {
  id: string;
  name: string;
  description?: string | null;
  service: ServicePlatform;
  pricePerMonth: number;
  minDuration: number;
  features: ServicePackageFeatures;
  imageUrl?: string | null;
}

export interface CreateServicePackageRequest {
  name: string;
  description?: string;
  service: ServicePlatform;
  pricePerMonth: number;
  minDuration?: number;
  features?: ServicePackageFeatures;
  sortOrder?: number;
  // Image is sent as multipart/form-data on the client, so not typed here
}

export interface UpdateServicePackageRequest
  extends Partial<CreateServicePackageRequest> {
  isActive?: boolean;
}

export interface ServicePackageSubscription {
  id: string;
  package: ServicePackage;
  duration: number;
  price: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  daysRemaining: number;
}

export interface ServicePackageSubscriptionSummary {
  id: string;
  service: ServicePlatform;
  serviceName: string;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isActive: boolean;
}

export interface PurchaseServicePackageRequest {
  duration: number;
}

export interface PurchaseServicePackageResponse {
  subscriptionId: string;
  packageName: string;
  service: ServicePlatform;
  duration: number;
  startDate: string;
  endDate: string;
  price: number;
}

export interface CheckServicePackageResponse {
  isActive: boolean;
  subscription: ServicePackageSubscriptionSummary | null;
}

// System Config Types
export type SystemConfigCategory =
  | 'platform'
  | 'ai'
  | 'security'
  | 'billing'
  | 'features'
  | 'maintenance'
  | 'safeguards';

export type SystemConfigType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface SystemConfig {
  id: string;
  category: SystemConfigCategory;
  key: string;
  value: unknown;
  type: SystemConfigType;
  description: string | null;
  isEditable: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}


export interface SystemConfigDetailResponse {
  data: {
    category: string;
    key: string;
    value: unknown;
    type: string;
  };
}

export interface CreateSystemConfigRequest {
  category: SystemConfigCategory;
  key: string;
  value: unknown;
  type: SystemConfigType;
  description?: string;
  isEditable?: boolean;
}

export interface UpdateSystemConfigRequest {
  value?: unknown;
  description?: string;
  isEditable?: boolean;
}

export interface GetSystemConfigsParams {
  category?: SystemConfigCategory;
  page?: number;
  limit?: number;
  search?: string;
}

export interface InitializeSystemConfigsResponse {
  message: string;
}

// AI Models Types
export type AIModelProvider = 'openai' | 'gemini' | 'deepseek';
export type AIModelCategory = 'budget' | 'balanced' | 'premium';

export interface AIModelConfig {
  name: string;
  displayName: string;
  description: string;
  provider: AIModelProvider;
  category: AIModelCategory;
  recommended: boolean;
  modelRatio: number;
  outputRatio: number;
  cacheRatio: number;
  cacheCreationRatio: number;
  groupRatio: number;
  promptPrice: number; // $ per 1M tokens
  completionPrice: number; // $ per 1M tokens
  cachePrice: number; // $ per 1M tokens
  cacheCreationPrice: number; // $ per 1M tokens
  aliases?: string[];
}

export interface CreateAIModelRequest {
  name: string;
  displayName: string;
  description: string;
  provider: AIModelProvider;
  category: AIModelCategory;
  recommended?: boolean;
  modelRatio?: number;
  outputRatio?: number;
  cacheRatio?: number;
  cacheCreationRatio?: number;
  groupRatio?: number;
  promptPrice: number;
  completionPrice: number;
  cachePrice?: number;
  cacheCreationPrice?: number;
  aliases?: string[];
}

export interface UpdateAIModelRequest
  extends Partial<Omit<CreateAIModelRequest, 'name'>> {}

// AI Logs Types
export interface AIRequestLog {
  id: string;
  tenantId?: string;
  userId?: string;
  conversationId?: string;
  chatbotId?: string;
  provider: string;
  model: string;
  requestUrl?: string;
  requestMethod: string;
  requestBody?: unknown;
  statusCode?: number;
  responseTime?: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
  modelRatio?: number;
  outputRatio?: number;
  cacheRatio?: number;
  cacheCreationRatio?: number;
  groupRatio?: number;
  promptPrice?: number;
  completionPrice?: number;
  cachePrice?: number;
  cacheCreationPrice?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  error?: string | null;
  createdAt: string;
}

export interface GetAILogsParams {
  tenantId?: string;
  provider?: AIModelProvider;
  model?: string;
  ipAddress?: string;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  page?: number;
  limit?: number;
}

// AI Logs Suspicious IPs Types
export interface AILogsSuspiciousIP {
  ipAddress: string;
  requestCount: number;
  totalTokens: number;
  totalCost: number;
  firstRequestAt: string;
  lastRequestAt: string;
  timeWindow: string;
  providers: string[];
  models: string[];
}

export interface GetAILogsSuspiciousIPsParams {
  threshold?: number;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}

// Proxy Balance Types
export interface ProxyBalance {
  remain_quota: number;
  used_quota: number;
}

// IP Management Types
export interface IPEntry {
  id: string;
  ipAddress: string;
  reason: string | null;
  bannedBy?: string;
  addedBy?: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIPEntryRequest {
  ipAddress: string;
  reason?: string;
  expiresAt?: string; // ISO 8601 datetime
}

export interface GetIPEntriesParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface ToggleIPEntryRequest {
  isActive: boolean;
}

// IP Access Logs Types
export interface AccessLog {
  id: string;
  ipAddress: string;
  method: string;
  url: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userAgent: string | null;
  referer: string | null;
  tenantId: string | null;
  userId: string | null;
  error: string | null;
  createdAt: string;
}

export interface GetAccessLogsParams {
  page?: number;
  limit?: number;
  ipAddress?: string;
  tenantId?: string;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}

export interface SuspiciousIP {
  ipAddress: string;
  riskScore: number;
  requestCount: number;
  requestsPerMinute: number;
  errorRate: number;
  failedAuthCount: number;
  suspiciousFactors: string[];
  lastRequestAt: string;
  recommendation: 'ban' | 'monitor' | 'safe';
}

export interface GetSuspiciousIPsParams {
  minRiskScore?: number;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}

export interface IPDetails {
  ipAddress: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  methods: Record<string, number>;
  statusCodes: Record<string, number>;
  paths: Array<{ path: string; count: number }>;
  lastRequestAt: string;
  isBlacklisted: boolean;
  isWhitelisted: boolean;
}

export interface GetIPDetailsParams {
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}

export interface BanIPFromSuspiciousRequest {
  reason?: string;
  expiresAt?: string; // ISO 8601 datetime
}

// Credit Package Types
export interface CreditPackage {
  id: string;
  name: string;
  creditAmount: number;
  priceVND: number;
  bonusCredit: number;
  isActive: boolean;
}

// Analytics Types
export interface AnalyticsOverview {
  revenue: {
    total: number;
    previousPeriod?: number;
    changePercent?: number;
  };
  creditSpent: {
    total: number;
    previousPeriod?: number;
    changePercent?: number;
  };
  tenants: {
    total: number;
    active: number;
    new: number;
    previousPeriod?: number;
    changePercent?: number;
  };
  aiRequests: {
    total: number;
    previousPeriod?: number;
    changePercent?: number;
  };
  tokens: {
    total: number;
    prompt: number;
    completion: number;
    previousPeriod?: number;
    changePercent?: number;
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    successRate: number;
  };
  systemHealth: {
    uptime: number;
    apiRequestRate: number;
    cacheHitRate: number;
  };
}

export interface GetAnalyticsOverviewParams {
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  period?: 'day' | 'week' | 'month';
  compareWithPrevious?: boolean;
}

export interface GrowthDataPoint {
  date: string; // ISO 8601
  value: number;
  previousValue?: number;
}

export interface GrowthAnalytics {
  data: GrowthDataPoint[];
  summary: {
    total: number;
    average: number;
    growth: number; // % change
  };
}

export interface GetGrowthAnalyticsParams {
  startDate: string; // Required
  endDate: string; // Required
  metric: 'users' | 'tenants' | 'revenue' | 'ai_requests' | 'tokens';
  interval?: 'hour' | 'day' | 'week' | 'month';
}

export interface RevenueTimelinePoint {
  period: string;
  revenue: number;
  transactions: number;
}

export interface RevenueByTenant {
  tenantId: string;
  tenantName: string;
  revenue: number;
  transactions: number;
}

export interface RevenueByPaymentMethod {
  method: string;
  revenue: number;
  count: number;
}

export interface RevenueAnalytics {
  timeline: RevenueTimelinePoint[];
  byTenant?: RevenueByTenant[];
  byPaymentMethod?: RevenueByPaymentMethod[];
  total: {
    revenue: number;
    transactions: number;
  };
}

export interface GetRevenueAnalyticsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'tenant';
  limit?: number;
}

export interface AIUsageByProvider {
  provider: string;
  requests: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
}

export interface AIUsageByModel {
  model: string;
  provider: string;
  requests: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
}

export interface AIUsageByHour {
  hour: number; // 0-23
  requests: number;
  avgResponseTime: number;
}

export interface AIUsageAnalytics {
  byProvider: AIUsageByProvider[];
  byModel: AIUsageByModel[];
  byHour?: AIUsageByHour[];
  summary: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    avgResponseTime: number;
  };
}

export interface GetAIUsageAnalyticsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'provider' | 'model' | 'hour' | 'day';
  tenantId?: string;
}

export interface PlatformDistribution {
  platform: string;
  conversations: number;
  messages: number;
  activeUsers: number;
  percentage: number;
}

export interface PlatformAnalytics {
  distribution: PlatformDistribution[];
  total: {
    conversations: number;
    messages: number;
    activeUsers: number;
  };
}

export interface GetPlatformAnalyticsParams {
  startDate?: string;
  endDate?: string;
  metric?: 'conversations' | 'messages' | 'active_users';
}

export interface TopListItem {
  id: string;
  name: string;
  value: number;
  change?: number; // % change
  metadata?: Record<string, unknown>;
}

export interface TopListAnalytics {
  items: TopListItem[];
}

export interface GetTopListAnalyticsParams {
  type: 'tenants' | 'users' | 'chatbots';
  metric: 'revenue' | 'ai_requests' | 'conversations' | 'messages' | 'credit_spent';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface HealthPerformancePoint {
  timestamp: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  successRate: number;
}

export interface ProxyBalanceInfo {
  remain: number;
  used: number;
  percentage: number;
}

export interface HealthError {
  type: string;
  count: number;
  lastOccurred: string;
}

export interface SystemHealthAnalytics {
  performance: HealthPerformancePoint[];
  infrastructure: {
    apiRequestRate: number;
    databaseQueryTime: number;
    cacheHitRate: number;
    proxyBalance: ProxyBalanceInfo;
  };
  errors: HealthError[];
}

export interface GetSystemHealthAnalyticsParams {
  startDate?: string;
  endDate?: string;
  interval?: 'hour' | 'day';
}


