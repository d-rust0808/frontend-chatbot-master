'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getUsers, topUpUserBalance } from '@/lib/api/admin';
import type { TopUpUserBalanceRequest } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
  Label,
} from '@/components/ui';
import { Search, Wallet, Coins } from 'lucide-react';
import type { User } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';
import { useLoading } from '@/components/loading-provider';
import { useAlert } from '@/components/alert-provider';

const topUpSchema = z
  .object({
    vndAmount: z
      .number({ invalid_type_error: 'VND phải là số' })
      .min(0, 'VND phải >= 0')
      .optional(),
    creditAmount: z
      .number({ invalid_type_error: 'Credit phải là số' })
      .min(0, 'Credit phải >= 0')
      .optional(),
    reason: z.string().max(500, 'Lý do tối đa 500 ký tự').optional(),
  })
  .refine(
    (data) => data.vndAmount !== undefined || data.creditAmount !== undefined,
    {
      message: 'Phải nhập ít nhất một loại tiền (VND hoặc Credit)',
      path: ['vndAmount'],
    }
  );

type TopUpFormData = z.infer<typeof topUpSchema>;

interface TopUpFormProps {
  userId: string;
  userName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function TopUpForm({ userId, userName, onSuccess, onCancel }: TopUpFormProps) {
  const { withLoading } = useLoading();
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      vndAmount: undefined,
      creditAmount: undefined,
      reason: '',
    },
  });

  const topUpMutation = useMutation({
    mutationFn: async (data: TopUpFormData) => {
      const request: TopUpUserBalanceRequest = {
        vndAmount: data.vndAmount,
        creditAmount: data.creditAmount,
        reason: data.reason || undefined,
      };

      return withLoading(topUpUserBalance(userId, request));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      reset();
      showAlert({
        message: 'Nạp tiền thành công',
        description: `Số dư mới: ${data.data.newBalance.toLocaleString('vi-VN')} VND | Credit mới: ${data.data.newCredit.toLocaleString('vi-VN')}`,
        variant: 'success',
        timeoutMs: 8000,
      });
      onSuccess();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      showAlert({
        message: 'Không thể nạp tiền',
        description: errorMessage,
        variant: 'error',
        timeoutMs: 8000,
      });
    },
  });

  const onSubmit = (data: TopUpFormData) => {
    topUpMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nạp tiền cho user</CardTitle>
          <CardDescription>{userName}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vndAmount">Số tiền VND</Label>
              <Input
                id="vndAmount"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                {...register('vndAmount', { valueAsNumber: true })}
              />
              {errors.vndAmount && (
                <p className="text-sm text-destructive">
                  {errors.vndAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditAmount">Số Credit</Label>
              <Input
                id="creditAmount"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                {...register('creditAmount', { valueAsNumber: true })}
              />
              {errors.creditAmount && (
                <p className="text-sm text-destructive">
                  {errors.creditAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Lý do (tùy chọn)</Label>
              <Input
                id="reason"
                type="text"
                maxLength={500}
                placeholder="Manual top-up by admin"
                {...register('reason')}
              />
              {errors.reason && (
                <p className="text-sm text-destructive">
                  {errors.reason.message}
                </p>
              )}
            </div>

            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || topUpMutation.isPending}
              >
                {isSubmitting || topUpMutation.isPending
                  ? 'Đang xử lý...'
                  : 'Nạp tiền'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function formatBalance(balance?: number): string {
  if (balance === undefined || balance === null) {
    return '0';
  }
  return balance.toLocaleString('vi-VN');
}

function formatCredit(credit?: number): string {
  if (credit === undefined || credit === null) {
    return '0';
  }
  return credit.toLocaleString('vi-VN');
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const limit = 20;

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, limit, search }],
    queryFn: () => getUsers({ page, limit, search: search || undefined }),
  });

  const users = usersData?.data || [];
  const selectedUser = users.find((u: User) => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Quản lý users và số dư (balance/credit)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Users</CardTitle>
          <CardDescription>
            Tìm kiếm và quản lý tất cả users trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo email hoặc tên..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy users
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{user.name}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {user.email}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-muted-foreground">
                          Balance:
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            (user.balance ?? 0) === 0
                              ? 'text-gray-500'
                              : 'text-green-600'
                          }`}
                        >
                          {formatBalance(user.balance)} VND
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-muted-foreground">
                          Credit:
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            (user.credit ?? 0) === 0
                              ? 'text-gray-500'
                              : 'text-blue-600'
                          }`}
                        >
                          {formatCredit(user.credit)}
                        </span>
                      </div>
                      {user._count && (
                        <Badge variant="outline" className="text-xs">
                          {user._count.tenants || 0} tenant(s)
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      Nạp tiền
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {users.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page}
                {usersData?.meta &&
                  ` / ${usersData.meta.totalPages} (Tổng: ${usersData.meta.total})`}
              </span>
              <Button
                variant="outline"
                disabled={
                  users.length < limit ||
                  (usersData?.meta && page >= usersData.meta.totalPages)
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <TopUpForm
          userId={selectedUser.id}
          userName={selectedUser.name}
          onSuccess={() => setSelectedUserId(null)}
          onCancel={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
