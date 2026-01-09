'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';

interface TenantPageProps {
  params: { tenantSlug: string };
}

const DURATIONS = [1, 3, 6, 12];

export default function TenantPlansPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;
  const queryClient = useQueryClient();
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
    mutationFn: (args: { packageId: string; duration: number }) =>
      purchaseServicePackage(args.packageId, { duration: args.duration }),
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({
        queryKey: ['service-packages', 'subscriptions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['service-packages', 'marketplace'],
      });
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (subscriptionId: string) =>
      cancelServicePackageSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['service-packages', 'subscriptions'],
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
    purchaseMutation.mutate({ packageId: pkg.id, duration });
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servicePackages.map((pkg) => {
                const selectedDuration =
                  selectedDurations[pkg.id] ?? pkg.minDuration ?? 1;
                return (
                  <Card key={pkg.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle>{pkg.name}</CardTitle>
                        <Badge variant="outline" className="uppercase">
                          {pkg.service}
                        </Badge>
                      </div>
                      {pkg.description && (
                        <CardDescription>{pkg.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-4">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-primary">
                          {pkg.pricePerMonth.toLocaleString('vi-VN')} VNĐ
                          <span className="text-sm font-normal text-muted-foreground">
                            {' '}
                            / tháng
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Thời gian tối thiểu: {pkg.minDuration} tháng
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Chọn thời hạn đăng ký
                        </p>
                        <Select
                          value={String(selectedDuration)}
                          onChange={(event) =>
                            handleDurationChange(pkg.id, event.target.value)
                          }
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
                        <p className="text-xs text-muted-foreground">
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
                        className="mt-auto w-full"
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((sub: ServicePackageSubscription) => (
                <Card key={sub.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{sub.package.name}</CardTitle>
                      <Badge
                        variant={
                          sub.status === 'active'
                            ? 'default'
                            : sub.status === 'expired'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <span className="block uppercase text-[11px] tracking-wide">
                        {sub.package.service}
                      </span>
                      <span className="block text-xs">
                        Thời gian: {sub.duration} tháng • Giá:{' '}
                        {sub.price.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Bắt đầu:{' '}
                      {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                      <br />
                      Kết thúc:{' '}
                      {new Date(sub.endDate).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs font-medium">
                      Còn lại:{' '}
                      <span
                        className={
                          sub.daysRemaining <= 0
                            ? 'text-destructive'
                            : sub.daysRemaining < 7
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {sub.daysRemaining} ngày
                      </span>
                    </p>
                    {sub.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1"
                        onClick={() => cancelMutation.mutate(sub.id)}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending
                          ? 'Đang huỷ...'
                          : 'Huỷ đăng ký'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

