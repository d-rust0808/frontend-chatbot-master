'use client';

import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getPlatformAnalytics } from '@/lib/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface PlatformDistributionChartProps {
  startDate?: string;
  endDate?: string;
  metric?: 'conversations' | 'messages' | 'active_users';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function PlatformDistributionChart({
  startDate,
  endDate,
  metric = 'conversations',
}: PlatformDistributionChartProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'platforms', { startDate, endDate, metric }],
    queryFn: () =>
      getPlatformAnalytics({
        startDate,
        endDate,
        metric,
      }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>Conversations and messages by platform</CardDescription>
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
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>Conversations and messages by platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Failed to load platform data
          </div>
        </CardContent>
      </Card>
    );
  }

  const platformData = data.data;

  if (!platformData.distribution || !Array.isArray(platformData.distribution) || platformData.distribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>Conversations and messages by platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            No platform data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Distribution</CardTitle>
        <CardDescription>Conversations and messages by platform</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Total Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Conversations</p>
            <p className="text-lg font-semibold">{formatNumber(platformData.total.conversations)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Messages</p>
            <p className="text-lg font-semibold">{formatNumber(platformData.total.messages)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Active Users</p>
            <p className="text-lg font-semibold">{formatNumber(platformData.total.activeUsers)}</p>
          </div>
        </div>

        {/* Pie Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={platformData.distribution as unknown as Array<Record<string, unknown>>}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: unknown) => {
                const e = entry as { platform?: string; percentage?: number };
                return `${e.platform ?? ''} ${(e.percentage ?? 0).toFixed(1)}%`;
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="conversations"
            >
              {platformData.distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              formatter={(value: number | undefined) => formatNumber(value ?? 0)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Table with Details */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Platform</th>
                <th className="text-right p-2 font-medium">Conversations</th>
                <th className="text-right p-2 font-medium">Messages</th>
                <th className="text-right p-2 font-medium">Active Users</th>
                <th className="text-right p-2 font-medium">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {platformData.distribution.map((platform, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium capitalize">{platform.platform}</td>
                  <td className="p-2 text-right">{formatNumber(platform.conversations)}</td>
                  <td className="p-2 text-right">{formatNumber(platform.messages)}</td>
                  <td className="p-2 text-right">{formatNumber(platform.activeUsers)}</td>
                  <td className="p-2 text-right">{platform.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

