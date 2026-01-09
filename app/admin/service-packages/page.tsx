'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Badge,
} from '@/components/ui';
import {
  getAdminServicePackages,
  createAdminServicePackage,
  updateAdminServicePackage,
  deleteAdminServicePackage,
} from '@/lib/api/service-packages';
import type { ServicePackage, ServicePlatform } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';
import { useLoading } from '@/components/loading-provider';
import { useAlert } from '@/components/alert-provider';

const servicePackageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Tên gói là bắt buộc'),
  description: z.string().optional(),
  service: z.enum(['whatsapp', 'messenger', 'tiktok', 'zalo', 'instagram', 'shopee']),
  pricePerMonth: z
    .number({ invalid_type_error: 'Giá phải là số' })
    .min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  minDuration: z
    .number({ invalid_type_error: 'Thời gian tối thiểu phải là số' })
    .min(1, 'Tối thiểu 1 tháng')
    .default(1),
  sortOrder: z.number().optional(),
  featuresJson: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ServicePackageFormData = z.infer<typeof servicePackageSchema>;

const SERVICE_OPTIONS: Array<{ value: ServicePlatform; label: string }> = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'zalo', label: 'Zalo' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'shopee', label: 'Shopee' },
];

export default function AdminServicePackagesPage() {
  const queryClient = useQueryClient();
  const { withLoading } = useLoading();
  const { showAlert } = useAlert();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    data: packagesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'service-packages'],
    queryFn: () => getAdminServicePackages(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServicePackageFormData>({
    resolver: zodResolver(servicePackageSchema),
    defaultValues: {
      service: 'whatsapp',
      minDuration: 1,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ServicePackageFormData) => {
      const parsedFeatures =
        data.featuresJson && data.featuresJson.trim().length > 0
          ? JSON.parse(data.featuresJson)
          : undefined;

      try {
        const result = await withLoading(
          createAdminServicePackage({
        name: data.name,
        description: data.description,
        service: data.service,
        pricePerMonth: data.pricePerMonth,
        minDuration: data.minDuration,
        sortOrder: data.sortOrder,
        features: parsedFeatures,
        imageFile,
          })
        );
        return result;
      } catch (error) {
        // Log error for debugging
        // eslint-disable-next-line no-console
        console.error('Create service package error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-packages'] });
      reset({
        id: undefined,
        name: '',
        description: '',
        service: 'whatsapp',
        pricePerMonth: undefined,
        minDuration: 1,
        sortOrder: undefined,
        featuresJson: '',
        isActive: true,
      });
      setImageFile(null);
      // Reset file input element
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      showAlert({
        message: 'Tạo gói dịch vụ thành công',
        variant: 'success',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      showAlert({
        message: 'Không thể tạo gói dịch vụ',
        description: errorMessage,
        variant: 'error',
        timeoutMs: 8000,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ServicePackageFormData) => {
      if (!data.id) {
        throw new Error('Thiếu id gói dịch vụ để cập nhật');
      }
      const parsedFeatures =
        data.featuresJson && data.featuresJson.trim().length > 0
          ? JSON.parse(data.featuresJson)
          : undefined;

      try {
        const result = await withLoading(
          updateAdminServicePackage(data.id, {
        name: data.name,
        description: data.description,
        service: data.service,
        pricePerMonth: data.pricePerMonth,
        minDuration: data.minDuration,
        sortOrder: data.sortOrder,
        features: parsedFeatures,
        isActive: data.isActive,
        imageFile,
          })
        );
        return result;
      } catch (error) {
        // Log error for debugging
        // eslint-disable-next-line no-console
        console.error('Update service package error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-packages'] });
      reset({
        service: 'whatsapp',
        minDuration: 1,
        isActive: true,
      });
      setImageFile(null);
      showAlert({
        message: 'Cập nhật gói dịch vụ thành công',
        variant: 'success',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      showAlert({
        message: 'Không thể cập nhật gói dịch vụ',
        description: errorMessage,
        variant: 'error',
        timeoutMs: 8000,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const result = await withLoading(deleteAdminServicePackage(id));
        return result;
      } catch (error) {
        // Log error for debugging
        // eslint-disable-next-line no-console
        console.error('Delete service package error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-packages'] });
      showAlert({
        message: 'Xóa gói dịch vụ thành công',
        variant: 'success',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      showAlert({
        message: 'Không thể xóa gói dịch vụ',
        description: errorMessage,
        variant: 'error',
        timeoutMs: 8000,
      });
    },
  });

  const handleEditClick = (pkg: ServicePackage) => {
    const featuresJson =
      pkg.features && Object.keys(pkg.features).length > 0
        ? JSON.stringify(pkg.features, null, 2)
        : '';

    setValue('id', pkg.id);
    setValue('name', pkg.name);
    setValue('description', pkg.description ?? '');
    setValue('service', pkg.service);
    setValue('pricePerMonth', pkg.pricePerMonth);
    setValue('minDuration', pkg.minDuration);
    setValue('sortOrder', pkg.sortOrder ?? undefined);
    setValue('featuresJson', featuresJson);
    setValue('isActive', pkg.isActive ?? true);
  };

  const onSubmit = (data: ServicePackageFormData) => {
    if (data.featuresJson) {
      try {
        JSON.parse(data.featuresJson);
      } catch {
        // eslint-disable-next-line no-alert
        alert('Features phải là JSON hợp lệ');
        return;
      }
    }

    if (data.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClearForm = () => {
    reset({
      id: undefined,
      name: '',
      description: '',
      service: 'whatsapp',
      pricePerMonth: undefined,
      minDuration: 1,
      sortOrder: undefined,
      featuresJson: '',
      isActive: true,
    });
    setImageFile(null);
    // Reset file input element
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const packages = packagesData?.data ?? [];

  useEffect(() => {
    setValue('isActive', true);
  }, [setValue]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      // eslint-disable-next-line no-alert
      alert('Ảnh vượt quá kích thước tối đa 5MB');
      event.target.value = '';
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Packages</h1>
        <p className="text-muted-foreground">
          Quản lý gói dịch vụ cho các nền tảng (SP-Admin).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tạo / Cập nhật gói dịch vụ</CardTitle>
          <CardDescription>
            Điền thông tin gói. Chọn gói trong danh sách bên dưới để chỉnh sửa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên gói *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Nền tảng *</Label>
                <Select id="service" {...register('service')}>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.service && (
                  <p className="text-sm text-destructive">
                    {errors.service.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" rows={3} {...register('description')} />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pricePerMonth">Giá / tháng (VNĐ) *</Label>
                <Input
                  id="pricePerMonth"
                  type="number"
                  {...register('pricePerMonth', { valueAsNumber: true })}
                />
                {errors.pricePerMonth && (
                  <p className="text-sm text-destructive">
                    {errors.pricePerMonth.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minDuration">Thời gian tối thiểu (tháng)</Label>
                <Input
                  id="minDuration"
                  type="number"
                  {...register('minDuration', { valueAsNumber: true })}
                />
                {errors.minDuration && (
                  <p className="text-sm text-destructive">
                    {errors.minDuration.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...register('sortOrder', { valueAsNumber: true })}
                />
                {errors.sortOrder && (
                  <p className="text-sm text-destructive">
                    {errors.sortOrder.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Ảnh gói dịch vụ</Label>
              <div className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />
                <label
                  htmlFor="image"
                  className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Chọn ảnh
                </label>
                <span className="flex-1 truncate text-sm text-muted-foreground">
                  {imageFile
                    ? `${imageFile.name} (${Math.round(
                        imageFile.size / 1024
                      ).toLocaleString('vi-VN')} KB)`
                    : 'Chưa chọn ảnh nào • jpg/png/webp, tối đa 5MB'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ảnh dùng để hiển thị trong marketplace và sidebar. Nếu không chọn ảnh
                mới, backend sẽ giữ nguyên ảnh hiện tại (nếu có).
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClearForm}>
                Làm mới form
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {isSubmitting || createMutation.isPending || updateMutation.isPending
                  ? 'Đang lưu...'
                  : 'Lưu gói dịch vụ'}
              </Button>
            </div>

            {(() => {
              const error = createMutation.error || updateMutation.error;
              if (!error) return null;
              const errorMessage = getErrorMessage(error);
              return (
                <p className="text-sm text-destructive">{errorMessage}</p>
              );
            })()}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách gói dịch vụ</CardTitle>
          <CardDescription>
            Chọn gói để chỉnh sửa hoặc xoá. Không thể xoá nếu có subscription đang
            hoạt động.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải gói dịch vụ...</p>
          ) : error ? (
            <p className="text-sm text-destructive">
              Không thể tải danh sách gói dịch vụ.
            </p>
          ) : packages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có gói dịch vụ nào. Hãy tạo gói mới phía trên.
            </p>
          ) : (
            <div className="space-y-2">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md"
                >
                  {/* Image Section */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-gray-50 to-gray-100">
                    {pkg.imageUrl ? (
                      <Image
                        src={pkg.imageUrl}
                        alt={pkg.name}
                        fill
                        className="object-contain p-1.5 transition-transform duration-200 group-hover:scale-105"
                        sizes="64px"
                        priority={false}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-lg font-bold text-gray-300 uppercase">
                          {pkg.service.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-1 items-center gap-4 overflow-hidden">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {pkg.name}
                        </h3>
                        <Badge
                          variant={pkg.isActive ? 'default' : 'secondary'}
                          className="shrink-0 text-xs"
                        >
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-xs uppercase"
                        >
                          {pkg.service}
                        </Badge>
                      </div>
                      {pkg.description && (
                        <p className="truncate text-sm text-gray-600">
                          {pkg.description}
                        </p>
                      )}
                      {/* Mobile: Show price inline */}
                      <div className="mt-1 flex items-center gap-3 md:hidden">
                        <span className="text-sm font-bold text-orange-600">
                          {pkg.pricePerMonth.toLocaleString('vi-VN')} VNĐ/tháng
                        </span>
                        <span className="text-xs text-gray-500">
                          • Tối thiểu {pkg.minDuration} tháng
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="hidden shrink-0 items-center gap-6 md:flex">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Giá / tháng</div>
                        <div className="text-sm font-bold text-orange-600">
                          {pkg.pricePerMonth.toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Tối thiểu</div>
                        <div className="text-sm font-medium text-gray-700">
                          {pkg.minDuration} tháng
                        </div>
                      </div>
                      {pkg.sortOrder !== null && pkg.sortOrder !== undefined && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Thứ tự</div>
                          <div className="text-sm text-gray-600">
                            #{pkg.sortOrder}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleEditClick(pkg)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          // eslint-disable-next-line no-alert
                          const confirmed = window.confirm(
                            'Bạn chắc chắn muốn xoá gói dịch vụ này?'
                          );
                          if (confirmed) {
                            deleteMutation.mutate(pkg.id);
                          }
                        }}
                      >
                        Xoá
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(() => {
                if (!deleteMutation.error) return null;
                const errorMessage = getErrorMessage(deleteMutation.error);
                return (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

