'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
} from '@/components/ui';
import { getPayments, getVNDTransactions } from '@/lib/api/payments';
import type { PaymentStatus } from '@/lib/api/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaymentHistoryPageProps {
  params: { tenantSlug: string };
}

export default function PaymentHistoryPage({ params }: PaymentHistoryPageProps) {
  const { tenantSlug } = params;
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', page, limit, statusFilter],
    queryFn: () =>
      getPayments({
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    enabled: true,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['vnd-transactions', page, limit],
    queryFn: () => getVNDTransactions({ page, limit }),
    enabled: true,
  });


  const payments = paymentsData?.data || [];
  const paymentsMeta = paymentsData?.meta;
  const transactions = transactionsData?.data?.transactions || [];
  const transactionsMeta = transactionsData?.data;

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      pending: 'secondary',
      expired: 'destructive',
      cancelled: 'outline',
    };
    const labels: Record<PaymentStatus, string> = {
      completed: 'Hoàn thành',
      pending: 'Đang chờ',
      expired: 'Hết hạn',
      cancelled: 'Đã hủy',
    };
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Lịch Sử Nạp Tiền</h1>
          <p className="text-muted-foreground">
            Xem lịch sử các giao dịch nạp tiền và giao dịch ví VNĐ
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lịch Sử Nạp Tiền</CardTitle>
                  <CardDescription>Danh sách các lệnh nạp tiền</CardDescription>
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as PaymentStatus | 'all');
                    setPage(1);
                  }}
                >
                  <option value="all">Tất cả</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="pending">Đang chờ</option>
                  <option value="expired">Hết hạn</option>
                  <option value="cancelled">Đã hủy</option>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Đang tải...
                </div>
              ) : payments.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có giao dịch nào
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-sm font-medium">
                              {payment.code}
                            </code>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {payment.amount.toLocaleString('vi-VN')} VNĐ
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleString('vi-VN')}
                            {payment.completedAt &&
                              ` • Hoàn thành: ${new Date(
                                payment.completedAt
                              ).toLocaleString('vi-VN')}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {paymentsMeta && paymentsMeta.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        Trang {paymentsMeta.page} / {paymentsMeta.totalPages} (
                        {paymentsMeta.total} giao dịch)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((p) =>
                              Math.min(paymentsMeta.totalPages, p + 1)
                            )
                          }
                          disabled={page >= paymentsMeta.totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch Sử Ví VNĐ</CardTitle>
              <CardDescription>Giao dịch trong ví VNĐ</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Đang tải...
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có giao dịch nào
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount.toLocaleString('vi-VN')} VNĐ
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {transaction.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleString(
                              'vi-VN'
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {transactionsMeta && transactionsMeta.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        Trang {transactionsMeta.page} /{' '}
                        {transactionsMeta.totalPages} ({transactionsMeta.total}{' '}
                        giao dịch)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((p) =>
                              Math.min(transactionsMeta.totalPages, p + 1)
                            )
                          }
                          disabled={page >= transactionsMeta.totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

