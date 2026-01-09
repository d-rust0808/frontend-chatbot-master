// Common API Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
  status_code?: number;
  api_version?: string;
  provider?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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


