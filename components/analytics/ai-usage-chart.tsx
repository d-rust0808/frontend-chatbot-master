'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getAIUsageAnalytics } from '@/lib/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AIUsageChartProps {
  startDate?: string;
  endDate?: string;
  groupBy?: 'provider' | 'model' | 'hour' | 'day';
  tenantId?: string;
}

function formatNumber(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function AIUsageChart({
  startDate,
  endDate,
  groupBy = 'provider',
  tenantId,
}: AIUsageChartProps) {
  const [view, setView] = useState<'provider' | 'model' | 'hour'>('provider');

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'ai-usage', { startDate, endDate, groupBy, tenantId }],
    queryFn: () =>
      getAIUsageAnalytics({
        startDate,
        endDate,
        groupBy,
        tenantId,
      }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Analytics</CardTitle>
          <CardDescription>AI requests by provider and model</CardDescription>
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
          <CardTitle>AI Usage Analytics</CardTitle>
          <CardDescription>AI requests by provider and model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Failed to load AI usage data
          </div>
        </CardContent>
      </Card>
    );
  }

  const aiData = data.data;

  // Check if we have any data
  const hasProviderData = aiData.byProvider && Array.isArray(aiData.byProvider) && aiData.byProvider.length > 0;
  const hasModelData = aiData.byModel && Array.isArray(aiData.byModel) && aiData.byModel.length > 0;
  const hasHourData = aiData.byHour && Array.isArray(aiData.byHour) && aiData.byHour.length > 0;

  if (!hasProviderData && !hasModelData && !hasHourData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Analytics</CardTitle>
          <CardDescription>AI requests by provider and model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            No AI usage data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Usage Analytics</CardTitle>
        <CardDescription>AI requests by provider and model</CardDescription>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setView('provider')}
            className={`px-3 py-1 text-xs rounded ${
              view === 'provider'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Provider
          </button>
          <button
            onClick={() => setView('model')}
            className={`px-3 py-1 text-xs rounded ${
              view === 'model'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Model
          </button>
          {aiData.byHour && aiData.byHour.length > 0 && (
            <button
              onClick={() => setView('hour')}
              className={`px-3 py-1 text-xs rounded ${
                view === 'hour'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Hour
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Requests</p>
            <p className="text-lg font-semibold">{formatNumber(aiData.summary.totalRequests)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Tokens</p>
            <p className="text-lg font-semibold">{formatNumber(aiData.summary.totalTokens)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold">{formatCurrency(aiData.summary.totalCost)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Avg Response</p>
            <p className="text-lg font-semibold">{aiData.summary.avgResponseTime.toFixed(0)}ms</p>
          </div>
        </div>

        {/* By Provider - Horizontal Bar Chart */}
        {view === 'provider' && aiData.byProvider && aiData.byProvider.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={aiData.byProvider}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                type="number"
                className="text-xs"
                tick={{ fill: '#6b7280' }}
                tickFormatter={formatNumber}
              />
              <YAxis
                type="category"
                dataKey="provider"
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
                formatter={(value: number | undefined) => formatNumber(value ?? 0)}
              />
              <Legend />
              <Bar dataKey="requests" fill="#3b82f6" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* By Model - Table View */}
        {view === 'model' && hasModelData && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Model</th>
                  <th className="text-left p-2 font-medium">Provider</th>
                  <th className="text-right p-2 font-medium">Requests</th>
                  <th className="text-right p-2 font-medium">Tokens</th>
                  <th className="text-right p-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {aiData.byModel.map((model, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{model.model}</td>
                    <td className="p-2">{model.provider}</td>
                    <td className="p-2 text-right">{formatNumber(model.requests)}</td>
                    <td className="p-2 text-right">{formatNumber(model.tokens.total)}</td>
                    <td className="p-2 text-right">{formatCurrency(model.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* By Hour - Line Chart */}
        {view === 'hour' && hasHourData && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aiData.byHour}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="hour"
                className="text-xs"
                tick={{ fill: '#6b7280' }}
                label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: '#6b7280' }}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
                formatter={(value: number | undefined) => formatNumber(value ?? 0)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Requests"
              />
              <Line
                type="monotone"
                dataKey="avgResponseTime"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Avg Response (ms)"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

