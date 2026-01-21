'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  MessageCircle,
  Video,
  ShoppingBag,
  Instagram,
  type LucideIcon,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Select,
  Badge,
} from '@/components/ui';
import {
  getServicePackages,
  getServicePackageSubscriptions,
  purchaseServicePackage,
  cancelServicePackageSubscription,
} from '@/lib/api/service-packages';
import type {
  ServicePackageListItem,
  ServicePackageSubscription,
  ServicePlatform,
} from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';
import { useAlert } from '@/components/alert-provider';
import { useLoading } from '@/components/loading-provider';
import { useConfirmDialog } from '@/components/confirm-dialog-provider';
import { BALANCES_QUERY_KEY } from '@/hooks/use-balance-updates';
import { ApiErrorException } from '@/lib/api/types';

// Map service platforms to icons
const getServiceIcon = (service: ServicePlatform): LucideIcon => {
  const iconMap: Record<ServicePlatform, LucideIcon> = {
    whatsapp: MessageSquare,
    messenger: MessageCircle,
    tiktok: Video,
    zalo: MessageCircle,
    instagram: Instagram,
    shopee: ShoppingBag,
  };
  return iconMap[service] || MessageSquare;
};

interface TenantPageProps {
  params: { tenantSlug: string };
}

const DURATIONS = [1, 3, 6, 12];

export default function TenantPlansPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { withLoading } = useLoading();
  const { showConfirm } = useConfirmDialog();
  const [selectedDurations, setSelectedDurations] = useState<
    Record<string, number>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: packagesData,
    isLoading: isLoadingPackages,
    error: packagesError,
  } = useQuery({
    queryKey: ['service-packages', 'marketplace'],
    queryFn: () => getServicePackages(),
  });

  const {
    data: subscriptionsData,
    isLoading: isLoadingSubscriptions,
    error: subscriptionsError,
  } = useQuery({
    queryKey: ['service-packages', 'subscriptions'],
    queryFn: () => getServicePackageSubscriptions(),
  });

  const purchaseMutation = useMutation({
    mutationFn: async (args: { packageId: string; duration: number }) =>
      withLoading(purchaseServicePackage(args.packageId, { duration: args.duration })),
    onSuccess: (response) => {
      setErrorMessage(null);
      const packageName = response.data.packageName || 'Gói dịch vụ';
      const duration = response.data.duration;
      const totalPrice = response.data.price || 0;
      
      showAlert({
        message: `Đăng ký ${packageName} ${duration} tháng thành công!`,
        description: `Tổng thanh toán: ${totalPrice.toLocaleString('vi-VN')} VNĐ. Gói dịch vụ đã được kích hoạt.`,
        variant: 'success',
        timeoutMs: 8000,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['service-packages', 'subscriptions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['service-packages', 'marketplace'],
      });
      // Invalidate balances to update wallet display
      queryClient.invalidateQueries({
        queryKey: BALANCES_QUERY_KEY,
      });
    },
    onError: (error) => {
      let errorMsg = getErrorMessage(error);
      
      // Handle specific error codes
      if (error instanceof ApiErrorException) {
        const errorCode = error.code;
        if (errorCode === 'INSUFFICIENT_VND_BALANCE') {
          errorMsg = 'Không đủ số dư VNĐ trong wallet. Vui lòng nạp thêm tiền vào wallet.';
          showAlert({
            message: 'Không đủ số dư VNĐ',
            description: `Vui lòng nạp thêm tiền vào wallet để tiếp tục đăng ký gói dịch vụ. Vào trang Nạp Tiền để nạp thêm.`,
            variant: 'error',
            timeoutMs: 10000,
          });
          // Auto redirect to payments page after 2 seconds
          setTimeout(() => {
            router.push(`/app/${tenantSlug}/payments`);
          }, 2000);
        } else if (errorCode === 'VALIDATION_ERROR') {
          errorMsg = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thời hạn đăng ký.';
        }
      }
      
      setErrorMessage(errorMsg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId: string) =>
      withLoading(cancelServicePackageSubscription(subscriptionId)),
    onSuccess: () => {
      showAlert({
        message: 'Đã hủy đăng ký gói dịch vụ thành công',
        variant: 'success',
        timeoutMs: 5000,
      });
      queryClient.invalidateQueries({
        queryKey: ['service-packages', 'subscriptions'],
      });
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error);
      showAlert({
        message: 'Không thể hủy đăng ký',
        description: errorMsg,
        variant: 'error',
        timeoutMs: 8000,
      });
    },
  });

  const handleDurationChange = (packageId: string, value: string) => {
    const duration = Number(value);
    if (!Number.isNaN(duration)) {
      setSelectedDurations((prev) => ({ ...prev, [packageId]: duration }));
    }
  };

  const handlePurchase = (pkg: ServicePackageListItem) => {
    const duration = selectedDurations[pkg.id] ?? pkg.minDuration ?? 1;
    const totalPrice = pkg.pricePerMonth * duration;
    
    showConfirm({
      title: 'Xác nhận mua gói dịch vụ',
      message: `Xác nhận mua gói "${pkg.name}"?\n\nThời hạn: ${duration} tháng\nGiá: ${totalPrice.toLocaleString('vi-VN')} VNĐ\n\nSố tiền sẽ được trừ từ số dư ví VNĐ của bạn.`,
      confirmText: 'Xác nhận mua',
      cancelText: 'Hủy',
      onConfirm: () => {
        purchaseMutation.mutate({ packageId: pkg.id, duration });
      },
    });
  };

  const handleCancel = (subscription: ServicePackageSubscription) => {
    showConfirm({
      title: 'Xác nhận hủy đăng ký',
      message: `Xác nhận hủy đăng ký gói "${subscription.package.name}"?\n\nGói dịch vụ sẽ bị hủy ngay lập tức và bạn sẽ không thể sử dụng dịch vụ sau khi hủy.`,
      confirmText: 'Hủy đăng ký',
      cancelText: 'Không',
      onConfirm: () => {
        cancelMutation.mutate(subscription.id);
      },
    });
  };

  const servicePackages = packagesData?.data ?? [];
  const subscriptions = subscriptionsData?.data ?? [];

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dịch Vụ & Gói Cước</h1>
          <p className="text-muted-foreground">
            Chọn và quản lý các gói dịch vụ nền tảng (WhatsApp, Messenger, TikTok, Zalo, ...).
          </p>
        </div>

        {errorMessage && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-4">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </CardContent>
          </Card>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Marketplace dịch vụ</h2>
              <p className="text-sm text-muted-foreground">
                Chọn gói phù hợp cho từng nền tảng. Thanh toán bằng số dư ví VNĐ.
              </p>
            </div>
          </div>

          {isLoadingPackages ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 w-32 bg-gray-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 w-24 bg-gray-200" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : packagesError ? (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-4">
                <p className="text-sm text-destructive">
                  Không thể tải danh sách gói dịch vụ. Vui lòng thử lại.
                </p>
              </CardContent>
            </Card>
          ) : servicePackages.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Chưa có gói dịch vụ</CardTitle>
                <CardDescription>
                  Liên hệ quản trị hệ thống để cấu hình gói dịch vụ.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {servicePackages.map((pkg) => {
                const selectedDuration =
                  selectedDurations[pkg.id] ?? pkg.minDuration ?? 1;
                return (
                  <Card key={pkg.id} className="flex flex-col">
                    <CardHeader className="pb-3 sm:pb-6">
                      <div className="flex items-start gap-2 sm:gap-3">
                        {pkg.imageUrl && (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-gray-50 to-gray-100 sm:h-12 sm:w-12">
                            <Image
                              src={pkg.imageUrl}
                              alt={pkg.name}
                              fill
                              className="object-contain p-1 sm:p-1.5"
                              sizes="(max-width: 640px) 40px, 48px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                            <CardTitle className="text-base sm:text-lg truncate">{pkg.name}</CardTitle>
                            <Badge variant="outline" className="uppercase shrink-0 text-[10px] sm:text-xs w-fit">
                              {pkg.service}
                            </Badge>
                          </div>
                          {pkg.description && (
                            <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1">
                              {pkg.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3 sm:gap-4 pt-0">
                      <div className="space-y-1">
                        <p className="text-xl sm:text-2xl font-bold text-primary">
                          {pkg.pricePerMonth.toLocaleString('vi-VN')} VNĐ
                          <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                            {' '}
                            / tháng
                          </span>
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">
                          Thời gian tối thiểu: {pkg.minDuration} tháng
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">
                          Chọn thời hạn đăng ký
                        </p>
                        <Select
                          value={String(selectedDuration)}
                          onChange={(event) =>
                            handleDurationChange(pkg.id, event.target.value)
                          }
                          className="h-11 sm:h-10 text-sm"
                        >
                          {DURATIONS.map((month) => (
                            <option
                              key={month}
                              value={month}
                              disabled={month < (pkg.minDuration ?? 1)}
                            >
                              {month} tháng
                            </option>
                          ))}
                        </Select>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">
                          Tổng:{' '}
                          <span className="font-semibold text-foreground">
                            {(
                              pkg.pricePerMonth * selectedDuration
                            ).toLocaleString('vi-VN')}{' '}
                            VNĐ
                          </span>
                        </p>
                      </div>

                      <Button
                        className="mt-auto w-full h-11 sm:h-10 text-sm sm:text-base font-semibold touch-manipulation"
                        onClick={() => handlePurchase(pkg)}
                        disabled={purchaseMutation.isPending}
                      >
                        {purchaseMutation.isPending
                          ? 'Đang xử lý...'
                          : 'Mua gói dịch vụ'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Đăng ký hiện tại</h2>
              <p className="text-sm text-muted-foreground">
                Xem trạng thái các gói dịch vụ bạn đã mua.
              </p>
            </div>
          </div>

          {isLoadingSubscriptions ? (
            <Card className="animate-pulse">
              <CardContent className="pt-4">
                <div className="h-4 w-40 bg-gray-200" />
              </CardContent>
            </Card>
          ) : subscriptionsError ? (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-4">
                <p className="text-sm text-destructive">
                  Không thể tải danh sách đăng ký dịch vụ.
                </p>
              </CardContent>
            </Card>
          ) : subscriptions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Chưa có đăng ký dịch vụ</CardTitle>
                <CardDescription>
                  Hãy mua gói dịch vụ ở danh sách phía trên để bắt đầu sử dụng nền tảng.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((sub: ServicePackageSubscription) => {
                const ServiceIcon = getServiceIcon(sub.package.service);
                return (
                  <Card key={sub.id} className="flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-3 mb-3">
                        {sub.package.imageUrl ? (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                            <Image
                              src={sub.package.imageUrl}
                              alt={sub.package.name}
                              fill
                              className="object-contain p-2"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                            <ServiceIcon className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <CardTitle className="text-lg font-semibold flex-1 truncate">
                              {sub.package.name}
                            </CardTitle>
                            <Badge
                              variant={
                                sub.status === 'active'
                                  ? 'default'
                                  : sub.status === 'expired'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="shrink-0 text-xs"
                            >
                              {sub.status === 'active' ? 'Đang hoạt động' : 
                               sub.status === 'expired' ? 'Hết hạn' : 
                               sub.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs uppercase">
                              <ServiceIcon className="mr-1 h-3 w-3" />
                              {sub.package.service}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        Thời gian: {sub.duration} tháng • Giá:{' '}
                        <span className="font-semibold text-foreground">
                          {sub.price.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                      <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Bắt đầu:</span>
                          <span className="font-medium">
                            {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Kết thúc:</span>
                          <span className="font-medium">
                            {new Date(sub.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-sm font-medium text-muted-foreground">
                            Còn lại:
                          </span>
                          <span
                            className={`text-base font-bold ${
                              sub.daysRemaining <= 0
                                ? 'text-destructive'
                                : sub.daysRemaining < 7
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {sub.daysRemaining} ngày
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-10 text-sm touch-manipulation border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleCancel(sub)}
                        disabled={cancelMutation.isPending || sub.status !== 'active'}
                      >
                        {cancelMutation.isPending
                          ? 'Đang huỷ...'
                          : 'Huỷ đăng ký'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

