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
import { getSystemHealthAnalytics } from '@/lib/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { format, parseISO } from 'date-fns';
import { Loader2, Activity, Database, AlertCircle } from 'lucide-react';

interface SystemHealthChartProps {
  startDate?: string;
  endDate?: string;
  interval?: 'hour' | 'day';
}

function formatTime(timestamp: string, interval: string): string {
  try {
    const date = parseISO(timestamp);
    if (interval === 'hour') {
      return format(date, 'HH:mm');
    }
    return format(date, 'MMM dd');
  } catch {
    return timestamp;
  }
}

export function SystemHealthChart({
  startDate,
  endDate,
  interval = 'hour',
}: SystemHealthChartProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'health', { startDate, endDate, interval }],
    queryFn: () =>
      getSystemHealthAnalytics({
        startDate,
        endDate,
        interval,
      }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Performance metrics</CardDescription>
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
          <CardTitle>System Health</CardTitle>
          <CardDescription>Performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Failed to load system health data
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthData = data.data;

  if (!healthData.performance || !Array.isArray(healthData.performance)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            No system health data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = healthData.performance.map((point) => ({
    timestamp: formatTime(point.timestamp, interval),
    avgResponseTime: point.avgResponseTime,
    p95ResponseTime: point.p95ResponseTime,
    p99ResponseTime: point.p99ResponseTime,
    errorRate: point.errorRate * 100,
    successRate: point.successRate * 100,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Infrastructure Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">API Request Rate</p>
            </div>
            <p className="text-lg font-semibold">
              {healthData.infrastructure.apiRequestRate.toFixed(1)} req/min
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">DB Query Time</p>
            </div>
            <p className="text-lg font-semibold">
              {healthData.infrastructure.databaseQueryTime.toFixed(0)}ms
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Cache Hit Rate</p>
            </div>
            <p className="text-lg font-semibold">
              {(healthData.infrastructure.cacheHitRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Proxy Balance</p>
            </div>
            <p className="text-lg font-semibold">
              {healthData.infrastructure.proxyBalance.percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {healthData.infrastructure.proxyBalance.remain.toLocaleString()} remain
            </p>
          </div>
        </div>

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="timestamp"
                className="text-xs"
                tick={{ fill: '#6b7280' }}
              />
              <YAxis
                yAxisId="left"
                className="text-xs"
                tick={{ fill: '#6b7280' }}
                label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs"
                tick={{ fill: '#6b7280' }}
                label={{ value: 'Rate (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgResponseTime"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Avg Response (ms)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="p95ResponseTime"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="P95 (ms)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="p99ResponseTime"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="P99 (ms)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="errorRate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Error Rate (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Success Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Errors Table */}
        {healthData.errors && healthData.errors.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Recent Errors
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Error Type</th>
                    <th className="text-right p-2 font-medium">Count</th>
                    <th className="text-right p-2 font-medium">Last Occurred</th>
                  </tr>
                </thead>
                <tbody>
                  {healthData.errors.map((error, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{error.type}</td>
                      <td className="p-2 text-right">{error.count}</td>
                      <td className="p-2 text-right text-muted-foreground">
                        {format(parseISO(error.lastOccurred), 'MMM dd, HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

