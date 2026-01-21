'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminBalanceLogs } from '@/lib/api/admin';
import type { BalanceLog, BalanceLogsMeta } from '@/lib/api/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
  Select,
  Label,
} from '@/components/ui';
import { Search, Wallet, Coins } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';

function formatAmount(amount: number, type: 'vnd' | 'credit'): string {
  if (type === 'vnd') {
    return `${amount.toLocaleString('vi-VN')} VND`;
  }
  return `${amount.toLocaleString('vi-VN')} Credits`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('userId');
}

export default function AdminBillingPage() {
  const [adminId, setAdminId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [type, setType] = useState<'vnd' | 'credit' | 'all'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [tenantSearch, setTenantSearch] = useState('');

  // Auto-load current user ID on mount
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      setAdminId(currentUserId);
    }
  }, []);

  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      type: 'vnd' | 'credit' | 'all';
      startDate?: string;
      endDate?: string;
    } = {
      page,
      limit,
      type,
    };

    if (startDate) {
      params.startDate = new Date(startDate).toISOString();
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      params.endDate = endDateTime.toISOString();
    }

    return params;
  }, [page, limit, type, startDate, endDate]);

  const { data: logsData, isLoading, error } = useQuery({
    queryKey: ['admin', 'balance-logs', adminId, queryParams],
    queryFn: () => getAdminBalanceLogs(adminId, queryParams),
    enabled: !!adminId,
  });

  const logs = logsData?.data || [];
  const meta = logsData?.meta as BalanceLogsMeta | undefined;

  const filteredLogs = useMemo(() => {
    if (!tenantSearch.trim()) {
      return logs;
    }
    const searchLower = tenantSearch.toLowerCase();
    return logs.filter(
      (log: BalanceLog) =>
        (log.tenantName?.toLowerCase().includes(searchLower) ?? false) ||
        (log.tenantId?.toLowerCase().includes(searchLower) ?? false)
    );
  }, [logs, tenantSearch]);

  const handleResetFilters = () => {
    setType('all');
    setStartDate('');
    setEndDate('');
    setTenantSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Quản lý nạp tiền và xem logs biến động số dư (balance logs)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Balance Logs</CardTitle>
          <CardDescription>
            Xem logs biến động số dư của admin (top-up actions). Admin ID được tự động lấy từ session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminId">Admin ID</Label>
              <Input
                id="adminId"
                placeholder="Nhập Admin ID (tự động lấy từ session)..."
                value={adminId}
                onChange={(e) => {
                  setAdminId(e.target.value);
                  setPage(1);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Để xem logs của admin khác, nhập Admin ID vào đây
              </p>
            </div>

            {adminId && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="type">Loại transaction</Label>
                    <Select
                      id="type"
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value as 'vnd' | 'credit' | 'all');
                        setPage(1);
                      }}
                    >
                      <option value="all">Tất cả</option>
                      <option value="vnd">VND</option>
                      <option value="credit">Credit</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Từ ngày</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Đến ngày</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                  >
                    Reset filters
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {adminId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách Logs</CardTitle>
                <CardDescription>
                  {meta?.admin
                    ? `Logs của admin: ${meta.admin.name} (${meta.admin.email})`
                    : 'Đang tải...'}
                </CardDescription>
              </div>
              {meta && (
                <Badge variant="outline">
                  Tổng: {meta.total} transactions
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">{getErrorMessage(error)}</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {logs.length === 0
                  ? 'Không có logs nào'
                  : 'Không tìm thấy logs phù hợp với bộ lọc'}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tenant name hoặc ID..."
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-semibold">
                          Thời gian
                        </th>
                        <th className="text-left p-3 text-sm font-semibold">
                          Loại
                        </th>
                        <th className="text-right p-3 text-sm font-semibold">
                          Số tiền
                        </th>
                        <th className="text-left p-3 text-sm font-semibold">
                          Tenant
                        </th>
                        <th className="text-left p-3 text-sm font-semibold">
                          Lý do
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log: BalanceLog) => (
                        <tr
                          key={log.id}
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3 text-sm">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                log.type === 'vnd' ? 'default' : 'secondary'
                              }
                              className={
                                log.type === 'vnd'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }
                            >
                              {log.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {log.type === 'vnd' ? (
                                <Wallet className="h-4 w-4 text-green-600" />
                              ) : (
                                <Coins className="h-4 w-4 text-blue-600" />
                              )}
                              <span
                                className={`text-sm font-semibold ${
                                  log.type === 'vnd'
                                    ? 'text-green-600'
                                    : 'text-blue-600'
                                }`}
                              >
                                {formatAmount(log.amount, log.type)}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            <div>
                              <div className="font-medium">{log.tenantName || '-'}</div>
                              <div className="text-xs text-muted-foreground">
                                {log.tenantId || '-'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {log.reason || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {meta && meta.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Trang {page} / {meta.totalPages} (Tổng: {meta.total})
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!adminId && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Không tìm thấy Admin ID trong session. Vui lòng đăng nhập lại hoặc nhập Admin ID thủ công.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
