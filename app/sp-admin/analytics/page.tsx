'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { getAnalyticsOverview } from '@/lib/api/admin';
import { GrowthTrendsChart } from '@/components/analytics/growth-trends-chart';
import { RevenueAnalyticsChart } from '@/components/analytics/revenue-analytics-chart';
import { AIUsageChart } from '@/components/analytics/ai-usage-chart';
import { PlatformDistributionChart } from '@/components/analytics/platform-distribution-chart';
import { TopListTable } from '@/components/analytics/top-list-table';
import { SystemHealthChart } from '@/components/analytics/system-health-chart';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Bot,
  MessageSquare,
  Activity,
  Zap,
  AlertCircle,
  Clock,
  Database,
} from 'lucide-react';

type DateRangePreset = 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';

interface DateRange {
  startDate: string;
  endDate: string;
}

function getDateRangeForPreset(preset: DateRangePreset): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today': {
      const start = new Date(today);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
    case 'last7days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
    case 'last30days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
    default:
      return {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(today).toISOString(),
      };
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export default function SpAdminAnalyticsPage() {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('last30days');
  const dateRange = getDateRangeForPreset(datePreset);

  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['analytics', 'overview', dateRange],
    queryFn: () =>
      getAnalyticsOverview({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        period: 'month',
        compareWithPrevious: true,
      }),
    retry: 1,
  });

  const overview = overviewData?.data;

  const statCards = [
    {
      title: 'Total Revenue',
      value: overview?.revenue.total
        ? formatCurrency(overview.revenue.total)
        : 'N/A',
      change: overview?.revenue.changePercent,
      icon: DollarSign,
      description: 'Total revenue in period',
    },
    {
      title: 'Credit Spent',
      value: overview?.creditSpent.total
        ? formatNumber(overview.creditSpent.total)
        : 'N/A',
      change: overview?.creditSpent.changePercent,
      icon: Zap,
      description: 'Total credit consumed',
    },
    {
      title: 'Active Tenants',
      value: overview?.tenants.active ?? 0,
      change: overview?.tenants.changePercent,
      icon: Building2,
      description: `${overview?.tenants.new ?? 0} new this period`,
    },
    {
      title: 'AI Requests',
      value: overview?.aiRequests.total
        ? formatNumber(overview.aiRequests.total)
        : 'N/A',
      change: overview?.aiRequests.changePercent,
      icon: Bot,
      description: 'Total AI API requests',
    },
    {
      title: 'Total Tokens',
      value: overview?.tokens.total
        ? formatNumber(overview.tokens.total)
        : 'N/A',
      change: overview?.tokens.changePercent,
      icon: Activity,
      description: `${overview?.tokens.prompt ? formatNumber(overview.tokens.prompt) : '0'} prompt / ${overview?.tokens.completion ? formatNumber(overview.tokens.completion) : '0'} completion`,
    },
    {
      title: 'Avg Response Time',
      value: overview?.performance.avgResponseTime
        ? `${overview.performance.avgResponseTime.toFixed(0)}ms`
        : 'N/A',
      icon: Clock,
      description: `P95: ${overview?.performance.p95ResponseTime ? overview.performance.p95ResponseTime.toFixed(0) : 'N/A'}ms`,
    },
    {
      title: 'Error Rate',
      value: overview?.performance.errorRate
        ? `${(overview.performance.errorRate * 100).toFixed(2)}%`
        : 'N/A',
      icon: AlertCircle,
      description: `Success: ${overview?.performance.successRate ? (overview.performance.successRate * 100).toFixed(1) : 'N/A'}%`,
    },
    {
      title: 'System Uptime',
      value: overview?.systemHealth.uptime
        ? `${(overview.systemHealth.uptime / 3600).toFixed(1)}h`
        : 'N/A',
      icon: Database,
      description: `Cache hit: ${overview?.systemHealth.cacheHitRate ? (overview.systemHealth.cacheHitRate * 100).toFixed(1) : 'N/A'}%`,
    },
  ];

  const presets: Array<{ value: DateRangePreset; label: string }> = [
    { value: 'today', label: 'Today' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            System-wide analytics and insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setDatePreset(preset.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  datePreset === preset.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {overviewError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>
                Failed to load analytics data. Backend API may not be implemented yet or is not accessible.
                {overviewError instanceof Error && ` (${overviewError.message})`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      {overviewLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-40 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const change = stat.change;
            const hasChange = change !== undefined && change !== null;

            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {hasChange && (
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${
                          change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercent(change)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <GrowthTrendsChart
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          metric="users"
          interval="day"
        />
        <RevenueAnalyticsChart
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          groupBy="day"
        />
        <AIUsageChart
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          groupBy="provider"
        />
        <PlatformDistributionChart
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
        />
      </div>

      {/* Top Lists Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <TopListTable
          type="tenants"
          metric="revenue"
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          limit={10}
        />
        <TopListTable
          type="users"
          metric="ai_requests"
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          limit={10}
        />
        <SystemHealthChart
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          interval="hour"
        />
      </div>
    </div>
  );
}
