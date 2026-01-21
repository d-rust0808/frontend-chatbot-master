'use client';

import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getGrowthAnalytics } from '@/lib/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface GrowthTrendsChartProps {
  startDate: string;
  endDate: string;
  metric: 'users' | 'tenants' | 'revenue' | 'ai_requests' | 'tokens';
  interval?: 'hour' | 'day' | 'week' | 'month';
}

function formatDate(dateString: string, interval: string): string {
  const date = parseISO(dateString);
  switch (interval) {
    case 'hour':
      return format(date, 'HH:mm');
    case 'day':
      return format(date, 'MMM dd');
    case 'week':
      return format(date, 'MMM dd');
    case 'month':
      return format(date, 'MMM yyyy');
    default:
      return format(date, 'MMM dd');
  }
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
  if (metric === 'tokens') {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  }
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function GrowthTrendsChart({
  startDate,
  endDate,
  metric,
  interval = 'day',
}: GrowthTrendsChartProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'growth', { startDate, endDate, metric, interval }],
    queryFn: () =>
      getGrowthAnalytics({
        startDate,
        endDate,
        metric,
        interval,
      }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
          <CardDescription>
            {metric.replace('_', ' ')} growth over time
          </CardDescription>
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
          <CardTitle>Growth Trends</CardTitle>
          <CardDescription>
            {metric.replace('_', ' ')} growth over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Failed to load growth data
          </div>
        </CardContent>
      </Card>
    );
  }

  const growthData = data.data;
  if (!growthData.data || !Array.isArray(growthData.data) || growthData.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
          <CardDescription>
            {metric.replace('_', ' ')} growth over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = growthData.data.map((point) => ({
    date: formatDate(point.date, interval),
    value: point.value,
    previousValue: point.previousValue,
  }));

  const summary = growthData.summary;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Trends</CardTitle>
        <CardDescription>
          {metric.replace('_', ' ')} growth over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => formatValue(value, metric)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              formatter={(value: number | undefined) => formatValue(value ?? 0, metric)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Current"
            />
            {chartData.some((d) => d.previousValue !== undefined) && (
              <Line
                type="monotone"
                dataKey="previousValue"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Previous"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="font-semibold">{formatValue(summary.total, metric)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Average</p>
            <p className="font-semibold">{formatValue(summary.average, metric)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Growth</p>
            <p className="font-semibold text-green-600">
              {summary.growth >= 0 ? '+' : ''}
              {summary.growth.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

