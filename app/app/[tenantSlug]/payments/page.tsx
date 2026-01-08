'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from '@/components/ui';
import {
  createPayment,
  getPendingPayment,
  cancelPendingPayment,
  getPaymentStatus,
  getVNDBalance,
} from '@/lib/api/payments';
import type { CreatePaymentRequest } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  FileText,
  CreditCard,
  Building2,
  DollarSign,
  Hash,
  Clock,
  RefreshCw,
  QrCode,
  Info,
} from 'lucide-react';
import Image from 'next/image';

const paymentSchema = z.object({
  amount: z
    .number()
    .min(10000, 'Số tiền tối thiểu là 10,000 VNĐ')
    .int('Số tiền phải là số nguyên'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentsPageProps {
  params: { tenantSlug: string };
}

export default function PaymentsPage({ params }: PaymentsPageProps) {
  const { tenantSlug } = params;
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPaymentCancelled, setIsPaymentCancelled] = useState(false);
  const [currentPaymentInfo, setCurrentPaymentInfo] = useState<{
    account: string;
    bank: string;
    content: string;
  } | null>(null);

  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ['vnd-balance'],
    queryFn: () => getVNDBalance(),
    retry: false,
    enabled: true,
  });

  const { data: pendingPaymentData, refetch: refetchPending } = useQuery({
    queryKey: ['pending-payment'],
    queryFn: async () => {
      try {
        return await getPendingPayment();
      } catch (error) {
        // Handle 404 - no pending payment (this is normal)
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            return null;
          }
        }
        throw error;
      }
    },
    retry: false,
    enabled: !isPaymentCancelled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: (query) => {
      // Don't refetch if payment was cancelled
      if (isPaymentCancelled) {
        return false;
      }
      const payment = query.state.data?.data;
      // Only refetch if payment exists and is pending
      if (payment?.status === 'pending') {
        return 10000;
      }
      // Stop refetching if no payment or query returned null
      return false;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 100000 },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) => createPayment(data),
    onSuccess: (response) => {
      setIsPaymentCancelled(false);
      setCurrentPaymentInfo(response.data.paymentInfo);
      refetchPending();
      reset();
    },
  });

  const cancelPaymentMutation = useMutation({
    mutationFn: () => cancelPendingPayment(),
    onSuccess: () => {
      // Disable query to stop all refetching
      setIsPaymentCancelled(true);
      // Set query data to null
      queryClient.setQueryData(['pending-payment'], null);
      setCurrentPaymentInfo(null);
      setTimeRemaining(null);
    },
  });

  const checkStatusMutation = useMutation({
    mutationFn: (code: string) => getPaymentStatus(code),
    onSuccess: (response) => {
      if (response.data.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['pending-payment'] });
        refetchBalance();
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        setCurrentPaymentInfo(null);
      }
    },
  });

  useEffect(() => {
    // If query returns null (404), clear everything
    if (pendingPaymentData === null) {
      setCurrentPaymentInfo(null);
      setTimeRemaining(null);
      return;
    }

    if (pendingPaymentData?.data) {
      const payment = pendingPaymentData.data;
      if (payment.status === 'pending') {
        // Set payment info if available from API response
        if (payment.paymentInfo) {
          setCurrentPaymentInfo({
            account: payment.paymentInfo.account,
            bank: payment.paymentInfo.bank,
            content: payment.paymentInfo.content,
          });
        }
        // Auto check status every 10 seconds
        const interval = setInterval(() => {
          checkStatusMutation.mutate(payment.code);
        }, 10000);
        return () => clearInterval(interval);
      } else {
        // Payment is not pending anymore
        setCurrentPaymentInfo(null);
        setTimeRemaining(null);
      }
    } else {
      setCurrentPaymentInfo(null);
      setTimeRemaining(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPaymentData]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const onSubmit = (data: PaymentFormData) => {
    createPaymentMutation.mutate({ amount: data.amount });
  };

  const pendingPayment = pendingPaymentData?.data;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nạp Tiền</h1>
          <p className="text-muted-foreground">
            Nạp tiền vào tài khoản VNĐ để sử dụng các dịch vụ
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Số Dư VNĐ</CardTitle>
              <CardDescription>Số dư hiện tại trong ví VNĐ</CardDescription>
            </CardHeader>
            <CardContent>
              {balanceData ? (
                <div className="text-3xl font-bold text-primary">
                  {balanceData.data.balance.toLocaleString('vi-VN')} VNĐ
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Chưa có số dư
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tạo Lệnh Nạp Tiền</CardTitle>
              <CardDescription>Số tiền tối thiểu: 10,000 VNĐ</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPaymentData?.data ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-yellow-900">
                          Đang có giao dịch chờ thanh toán
                        </p>
                        <p className="text-sm text-yellow-700">
                          Mã: {pendingPayment?.code} • Số tiền:{' '}
                          {pendingPayment?.amount.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelPaymentMutation.mutate()}
                        disabled={cancelPaymentMutation.isPending}
                      >
                        {cancelPaymentMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <label htmlFor="amount" className="text-xs sm:text-sm font-semibold text-gray-900">
                        Số tiền (VNĐ)
                      </label>
                    </div>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="100000"
                        className="h-11 sm:h-12 text-base sm:text-lg font-semibold pl-4 pr-14 sm:pr-12"
                        {...register('amount', { valueAsNumber: true })}
                      />
                      <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium text-muted-foreground">
                        VNĐ
                      </span>
                    </div>
                    {errors.amount && (
                      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2 sm:p-3">
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-red-900 leading-relaxed">{errors.amount.message}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Số tiền tối thiểu: 10,000 VNĐ
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
                    disabled={createPaymentMutation.isPending}
                  >
                    {createPaymentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span className="hidden sm:inline">Đang tạo...</span>
                        <span className="sm:hidden">Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Tạo Lệnh Nạp Tiền</span>
                        <span className="sm:hidden">Tạo Lệnh</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {pendingPayment && (
          <Card>
            <CardHeader>
              <CardTitle>Thanh Toán</CardTitle>
              <CardDescription>
                Quét QR Code hoặc chuyển khoản theo thông tin bên dưới
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pendingPayment.qrCode && (
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <div className="relative h-48 w-48 sm:h-64 sm:w-64 rounded-xl border-2 border-primary/20 bg-white p-3 sm:p-4 shadow-lg">
                    <Image
                      src={pendingPayment.qrCode}
                      alt="QR Code"
                      fill
                      sizes="(max-width: 640px) 192px, 256px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground text-center px-4">
                    <QrCode className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <p>Quét QR Code bằng app ngân hàng để thanh toán</p>
                  </div>
                </div>
              )}

              <div className="space-y-4 sm:space-y-6 rounded-lg border bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <label className="text-xs sm:text-sm font-semibold text-gray-900">
                      Mã Giao Dịch (QUAN TRỌNG)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border-2 border-primary bg-white px-2 py-2 sm:px-4 sm:py-3 font-mono text-base sm:text-xl font-bold text-primary shadow-sm break-all">
                      {pendingPayment.code}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(pendingPayment.code)}
                      className="h-10 w-10 sm:h-12 sm:w-12 p-0 flex-shrink-0"
                    >
                      {copiedCode === pendingPayment.code ? (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2 sm:p-3">
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium text-red-900 leading-relaxed">
                      BẮT BUỘC: Ghi mã này vào nội dung chuyển khoản
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Số Tài Khoản
                      </label>
                    </div>
                    <p className="font-mono text-base sm:text-lg font-semibold text-gray-900 break-all">
                      {currentPaymentInfo?.account ||
                        pendingPayment.paymentInfo?.account ||
                        'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Ngân Hàng
                      </label>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {currentPaymentInfo?.bank ||
                        pendingPayment.paymentInfo?.bank ||
                        'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Số Tiền
                      </label>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-primary">
                      {pendingPayment.amount.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-3 sm:p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Nội Dung
                      </label>
                    </div>
                    <p className="font-mono text-base sm:text-lg font-semibold text-gray-900 break-all">
                      {currentPaymentInfo?.content ||
                        pendingPayment.paymentInfo?.content ||
                        pendingPayment.code}
                    </p>
                  </div>
                </div>

                {pendingPayment.expiresAt && timeRemaining !== null && (
                  <div
                    className={`flex items-center gap-2 rounded-lg border p-3 sm:p-4 ${
                      timeRemaining < 60
                        ? 'border-red-200 bg-red-50'
                        : timeRemaining < 180
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <Clock
                      className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                        timeRemaining < 60
                          ? 'text-red-600'
                          : timeRemaining < 180
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      }`}
                    />
                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        timeRemaining < 60
                          ? 'text-red-900'
                          : timeRemaining < 180
                          ? 'text-orange-900'
                          : 'text-blue-900'
                      }`}
                    >
                      Hết hạn sau: <span className="text-base sm:text-lg">{timeRemaining}</span> giây
                      {timeRemaining === 0 && ' - Đã hết hạn'}
                    </p>
                  </div>
                )}

                <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-semibold text-blue-900">
                      Hướng Dẫn:
                    </p>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-900">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-700 flex-shrink-0">1.</span>
                      <span>Quét QR Code hoặc chuyển khoản đến số tài khoản trên</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-700 flex-shrink-0">2.</span>
                      <span>
                        Số tiền phải chính xác:{' '}
                        <strong className="text-blue-950">
                          {pendingPayment.amount.toLocaleString('vi-VN')} VNĐ
                        </strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-700 flex-shrink-0">3.</span>
                      <span>
                        Nội dung chuyển khoản PHẢI là mã:{' '}
                        <strong className="font-mono text-blue-950 break-all">
                          {pendingPayment.code}
                        </strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-700 flex-shrink-0">4.</span>
                      <span>Hệ thống sẽ tự động cộng tiền sau khi nhận được</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => checkStatusMutation.mutate(pendingPayment.code)}
                  disabled={checkStatusMutation.isPending}
                  className="flex-1 w-full sm:w-auto"
                  size="lg"
                >
                  {checkStatusMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Đang kiểm tra...</span>
                      <span className="sm:hidden">Đang kiểm tra...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Kiểm Tra Trạng Thái</span>
                      <span className="sm:hidden">Kiểm Tra</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => cancelPaymentMutation.mutate()}
                  disabled={cancelPaymentMutation.isPending}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  {cancelPaymentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Hủy Giao Dịch</span>
                      <span className="sm:hidden">Hủy</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {createPaymentMutation.isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                {getErrorMessage(createPaymentMutation.error)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

