import { apiClient } from './client';
import type {
  ApiResponse,
  ServicePackage,
  ServicePackageListItem,
  CreateServicePackageRequest,
  UpdateServicePackageRequest,
  ServicePackageSubscription,
  ServicePackageSubscriptionSummary,
  PurchaseServicePackageRequest,
  PurchaseServicePackageResponse,
  CheckServicePackageResponse,
  ServicePlatform,
} from './types';

// ---------- SP-Admin Endpoints ----------

export interface GetAdminServicePackagesParams {
  service?: ServicePlatform;
  isActive?: boolean;
}

export async function getAdminServicePackages(
  params?: GetAdminServicePackagesParams
): Promise<ApiResponse<ServicePackage[]>> {
  return apiClient.get('/admin/service-packages', params ? { params } : undefined);
}

export async function getAdminServicePackageById(
  id: string
): Promise<ApiResponse<ServicePackage>> {
  return apiClient.get(`/admin/service-packages/${id}`);
}

export async function createAdminServicePackage(
  data: CreateServicePackageRequest & { imageFile?: File | null }
): Promise<ApiResponse<ServicePackage>> {
  const formData = new FormData();

  formData.append('name', data.name);
  if (data.description) {
    formData.append('description', data.description);
  }
  formData.append('service', data.service);
  formData.append('pricePerMonth', String(data.pricePerMonth));
  if (typeof data.minDuration === 'number') {
    formData.append('minDuration', String(data.minDuration));
  }
  if (typeof data.sortOrder === 'number') {
    formData.append('sortOrder', String(data.sortOrder));
  }
  if (data.features) {
    formData.append('features', JSON.stringify(data.features));
  }
  if (data.imageFile) {
    formData.append('image', data.imageFile);
  }

  // Don't set Content-Type header manually - axios will set it automatically with boundary
  return apiClient.post('/admin/service-packages', formData);
}

export async function updateAdminServicePackage(
  id: string,
  data: UpdateServicePackageRequest & { imageFile?: File | null }
): Promise<ApiResponse<ServicePackage>> {
  const formData = new FormData();

  if (data.name !== undefined) {
    formData.append('name', data.name);
  }
  if (data.description !== undefined) {
    formData.append('description', data.description);
  }
  if (data.service !== undefined) {
    formData.append('service', data.service);
  }
  if (data.pricePerMonth !== undefined) {
    formData.append('pricePerMonth', String(data.pricePerMonth));
  }
  if (data.minDuration !== undefined) {
    formData.append('minDuration', String(data.minDuration));
  }
  if (data.sortOrder !== undefined) {
    formData.append('sortOrder', String(data.sortOrder));
  }
  if (data.features !== undefined) {
    formData.append('features', JSON.stringify(data.features));
  }
  if (data.isActive !== undefined) {
    formData.append('isActive', String(data.isActive));
  }
  if (data.imageFile) {
    formData.append('image', data.imageFile);
  }

  // Don't set Content-Type header manually - axios will set it automatically with boundary
  return apiClient.put(`/admin/service-packages/${id}`, formData);
}

export async function deleteAdminServicePackage(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete(`/admin/service-packages/${id}`);
}

// ---------- Tenant Admin Endpoints ----------

export interface GetServicePackagesParams {
  service?: ServicePlatform;
}

export async function getServicePackages(
  params?: GetServicePackagesParams
): Promise<ApiResponse<ServicePackageListItem[]>> {
  return apiClient.get('/service-packages', params ? { params } : undefined);
}

export async function purchaseServicePackage(
  packageId: string,
  body: PurchaseServicePackageRequest
): Promise<ApiResponse<PurchaseServicePackageResponse>> {
  return apiClient.post(`/service-packages/${packageId}/purchase`, body);
}

export async function getServicePackageSubscriptions(): Promise<
  ApiResponse<ServicePackageSubscription[]>
> {
  return apiClient.get('/service-packages/subscriptions');
}

export async function getMyServiceSubscriptions(): Promise<
  ApiResponse<ServicePackageSubscriptionSummary[]>
> {
  return apiClient.get('/service-packages/my-subscriptions');
}

export async function checkServicePackage(
  service: ServicePlatform
): Promise<ApiResponse<CheckServicePackageResponse>> {
  return apiClient.get(`/service-packages/check/${service}`);
}

export async function cancelServicePackageSubscription(
  subscriptionId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.post(
    `/service-packages/subscriptions/${subscriptionId}/cancel`
  );
}


