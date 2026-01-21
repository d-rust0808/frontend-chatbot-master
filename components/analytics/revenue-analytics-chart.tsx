'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getRevenueAnalytics } from '@/lib/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface RevenueAnalyticsChartProps {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'tenant';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string, groupBy: string): string {
  try {
    const date = parseISO(dateString);
    switch (groupBy) {
      case 'day':
        return format(date, 'MMM dd');
      case 'week':
        return format(date, 'MMM dd');
      case 'month':
        return format(date, 'MMM yyyy');
      default:
        return dateString;
    }
  } catch {
    return dateString;
  }
}

export function RevenueAnalyticsChart({
  startDate,
  endDate,
  groupBy = 'day',
}: RevenueAnalyticsChartProps) {
  const [view, setView] = useState<'timeline' | 'tenants' | 'methods'>('timeline');

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'revenue', { startDate, endDate, groupBy }],
    queryFn: () =>
      getRevenueAnalytics({
        startDate,
        endDate,
        groupBy,
        limit: 10,
      }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>Revenue trends and breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
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
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>Revenue trends and breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Failed to load revenue data
          </div>
        </CardContent>
      </Card>
    );
  }

  const revenueData = data.data;

  // Determine which view to show based on groupBy
  const showTimeline = groupBy !== 'tenant' && revenueData.timeline && Array.isArray(revenueData.timeline) && revenueData.timeline.length > 0;
  const showTenants = groupBy === 'tenant' && revenueData.byTenant && Array.isArray(revenueData.byTenant) && revenueData.byTenant.length > 0;
  const showMethods = revenueData.byPaymentMethod && Array.isArray(revenueData.byPaymentMethod) && revenueData.byPaymentMethod.length > 0;

  // If no data available, show empty state
  if (!showTimeline && !showTenants && !showMethods) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>Revenue trends and breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            No revenue data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analytics</CardTitle>
        <CardDescription>Revenue trends and breakdown</CardDescription>
        {showTimeline && showTenants && showMethods && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setView('timeline')}
              className={`px-3 py-1 text-xs rounded ${
                view === 'timeline'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setView('tenants')}
              className={`px-3 py-1 text-xs rounded ${
                view === 'tenants'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Top Tenants
            </button>
            <button
              onClick={() => setView('methods')}
              className={`px-3 py-1 text-xs rounded ${
                view === 'methods'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Payment Methods
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {showTimeline && (view === 'timeline' || !showTenants) && (
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData.timeline}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis
                  dataKey="period"
                  className="text-xs"
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => formatDate(value, groupBy)}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => {
                    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
                    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                    return value.toString();
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number | string | undefined) =>
                    formatCurrency(typeof value === 'number' ? value : 0)
                  }
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">
                Total Revenue: <span className="font-semibold">{formatCurrency(revenueData.total.revenue)}</span>
              </p>
              <p className="text-muted-foreground">
                Total Transactions: <span className="font-semibold">{revenueData.total.transactions}</span>
              </p>
            </div>
          </div>
        )}

        {showTenants && (view === 'tenants' || !showTimeline) && (
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={revenueData.byTenant}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => {
                    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
                    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                    return value.toString();
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="tenantName"
                  className="text-xs"
                  tick={{ fill: '#6b7280' }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {showMethods && (view === 'methods' || (!showTimeline && !showTenants)) && (
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData.byPaymentMethod as unknown as Array<Record<string, unknown>>}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: unknown) => {
                    const e = entry as { name?: string; percent?: number };
                    return `${e.name ?? ''} ${((e.percent ?? 0) * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {(revenueData.byPaymentMethod ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

