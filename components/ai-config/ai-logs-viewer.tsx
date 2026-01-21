'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  Badge,
} from '@/components/ui';
import { useAILogs } from '@/hooks/use-system-configs';
import type { GetAILogsParams, AIModelProvider } from '@/lib/api/types';
import { isPaginationMeta } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';

const PROVIDER_OPTIONS: Array<{ value: AIModelProvider | ''; label: string }> = [
  { value: '', label: 'All Providers' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'deepseek', label: 'DeepSeek' },
];

export function AILogsViewer() {
  const [filters, setFilters] = useState<GetAILogsParams>({
    page: 1,
    limit: 50,
  });

  const {
    data: logsData,
    isLoading,
    error,
  } = useAILogs(filters);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [filters.provider, filters.model, filters.ipAddress, filters.startDate, filters.endDate]);

  const handleFilterChange = <K extends keyof GetAILogsParams>(
    key: K,
    value: GetAILogsParams[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const formatCost = (cost?: number): string => {
    if (cost === undefined || cost === null) return '-';
    return `$${cost.toFixed(6)}`;
  };

  const formatTokens = (
    tokens?: { prompt: number; completion: number; total: number }
  ): string => {
    if (!tokens) return '-';
    return `${tokens.total.toLocaleString()} (${tokens.prompt.toLocaleString()}+${tokens.completion.toLocaleString()})`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const logs = logsData?.data ?? [];
  const meta = logsData?.meta && isPaginationMeta(logsData.meta) ? logsData.meta : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Request Logs</CardTitle>
        <CardDescription>
          View all AI API calls with filtering and pagination
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filter-provider">Provider</Label>
            <Select
              id="filter-provider"
              value={filters.provider || ''}
              onChange={(e) =>
                handleFilterChange('provider', e.target.value as AIModelProvider | undefined)
              }
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-model">Model</Label>
            <Input
              id="filter-model"
              placeholder="e.g., gpt-4o-mini"
              value={filters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-ip">IP Address</Label>
            <Input
              id="filter-ip"
              placeholder="192.168.1.100"
              value={filters.ipAddress || ''}
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-start-date">Start Date</Label>
            <Input
              id="filter-start-date"
              type="datetime-local"
              value={
                filters.startDate
                  ? new Date(filters.startDate).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                handleFilterChange(
                  'startDate',
                  e.target.value ? new Date(e.target.value).toISOString() : undefined
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-end-date">End Date</Label>
            <Input
              id="filter-end-date"
              type="datetime-local"
              value={
                filters.endDate
                  ? new Date(filters.endDate).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                handleFilterChange(
                  'endDate',
                  e.target.value ? new Date(e.target.value).toISOString() : undefined
                )
              }
            />
          </div>
        </div>

        {/* Logs Table */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading logs...</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            Failed to load logs: {getErrorMessage(error)}
          </p>
        ) : logs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm font-medium text-gray-900">No logs found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Time
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Provider
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Model
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      IP
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Tokens
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Cost
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Response Time
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        <Badge variant="outline">{log.provider}</Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs font-mono">
                        {log.model}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {log.ipAddress || '-'}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {formatTokens(log.tokens)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {formatCost(log.cost)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {log.responseTime ? `${log.responseTime}ms` : '-'}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {log.statusCode ? (
                          <Badge
                            variant={log.statusCode >= 400 ? 'destructive' : 'default'}
                          >
                            {log.statusCode}
                          </Badge>
                        ) : log.error ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  disabled={(filters.page || 1) <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages} (Total: {meta.total})
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  disabled={(filters.page || 1) >= meta.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

