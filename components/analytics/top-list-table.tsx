'use client';

import { useQuery } from '@tanstack/react-query';
import { getTopListAnalytics } from '@/lib/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface TopListTableProps {
  type: 'tenants' | 'users' | 'chatbots';
  metric: 'revenue' | 'ai_requests' | 'conversations' | 'messages' | 'credit_spent';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

function formatValue(value: number, metric: string): string {
  if (metric === 'revenue') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function TopListTable({
  type,
  metric,
  startDate,
  endDate,
  limit = 10,
}: TopListTableProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'top', { type, metric, startDate, endDate, limit }],
    queryFn: () =>
      getTopListAnalytics({
        type,
        metric,
        startDate,
        endDate,
        limit,
      }),
  });

  const titleMap: Record<string, string> = {
    tenants: 'Top Tenants',
    users: 'Top Users',
    chatbots: 'Top Chatbots',
  };

  const descriptionMap: Record<string, string> = {
    revenue: 'By revenue',
    ai_requests: 'By AI requests',
    conversations: 'By conversations',
    messages: 'By messages',
    credit_spent: 'By credit spent',
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titleMap[type]}</CardTitle>
          <CardDescription>{descriptionMap[metric]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titleMap[type]}</CardTitle>
          <CardDescription>{descriptionMap[metric]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            Failed to load {type} data
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = data.data.items;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titleMap[type]}</CardTitle>
          <CardDescription>{descriptionMap[metric]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titleMap[type]}</CardTitle>
        <CardDescription>{descriptionMap[metric]}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium w-12">#</th>
                <th className="text-left p-2 font-medium">Name</th>
                <th className="text-right p-2 font-medium">Value</th>
                {items.some((item) => item.change !== undefined) && (
                  <th className="text-right p-2 font-medium">Change</th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-muted-foreground">{index + 1}</td>
                  <td className="p-2 font-medium">{item.name}</td>
                  <td className="p-2 text-right font-semibold">
                    {formatValue(item.value, metric)}
                  </td>
                  {item.change !== undefined && (
                    <td className="p-2 text-right">
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          item.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span className="text-xs">{formatPercent(item.change)}</span>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

