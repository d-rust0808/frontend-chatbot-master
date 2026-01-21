'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { useProxyBalance } from '@/hooks/use-system-configs';
import { useLoading } from '@/components/loading-provider';
import { getErrorMessage } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

export function BalanceDisplay() {
  const { withLoading } = useLoading();

  const {
    data: balanceData,
    isLoading,
    error,
    refetch,
  } = useProxyBalance();

  const handleRefresh = async () => {
    await withLoading(refetch());
  };

  if (isLoading && !balanceData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading balance...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Failed to load balance: {getErrorMessage(error)}
          </p>
        </CardContent>
      </Card>
    );
  }

  const balance = balanceData?.data;
  if (!balance) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No balance data available</p>
        </CardContent>
      </Card>
    );
  }

  const total = balance.remain_quota + balance.used_quota;
  const usedPercentage = total > 0 ? (balance.used_quota / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Proxy Balance</CardTitle>
            <CardDescription>
              Current balance and usage from v98store proxy
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-1 text-sm font-medium text-muted-foreground">
              Remaining Quota
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${balance.remain_quota.toFixed(6)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-1 text-sm font-medium text-muted-foreground">
              Used Quota
            </div>
            <div className="text-3xl font-bold text-red-600">
              ${balance.used_quota.toFixed(6)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-1 text-sm font-medium text-muted-foreground">
              Total Quota
            </div>
            <div className="text-3xl font-bold">
              ${total.toFixed(6)}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Usage: {usedPercentage.toFixed(2)}%
            </span>
            <span className="text-muted-foreground">
              {balance.used_quota.toFixed(6)} / {total.toFixed(6)} USD
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${usedPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

