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
import { useAccessLogs } from '@/hooks/use-system-configs';
import type { GetAccessLogsParams } from '@/lib/api/types';
import { isPaginationMeta } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
const STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 500, 502, 503];

export function AccessLogsViewer() {
  const [filters, setFilters] = useState<GetAccessLogsParams>({
    page: 1,
    limit: 50,
  });

  const {
    data: logsData,
    isLoading,
    error,
  } = useAccessLogs(filters);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [
    filters.ipAddress,
    filters.method,
    filters.statusCode,
    filters.path,
    filters.startDate,
    filters.endDate,
  ]);

  const handleFilterChange = <K extends keyof GetAccessLogsParams>(
    key: K,
    value: GetAccessLogsParams[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadgeVariant = (statusCode: number): 'default' | 'destructive' | 'secondary' => {
    if (statusCode >= 200 && statusCode < 300) return 'default';
    if (statusCode >= 400) return 'destructive';
    return 'secondary';
  };

  const logs = logsData?.data ?? [];
  const meta = logsData?.meta && isPaginationMeta(logsData.meta) ? logsData.meta : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>IP Access Logs</CardTitle>
        <CardDescription>
          View all HTTP requests with filtering and pagination
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filter-ip">IP Address</Label>
            <Input
              id="filter-ip"
              placeholder="192.168.1.100"
              value={filters.ipAddress || ''}
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-method">Method</Label>
            <Select
              id="filter-method"
              value={filters.method || ''}
              onChange={(e) => handleFilterChange('method', e.target.value)}
            >
              <option value="">All Methods</option>
              {HTTP_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-status">Status Code</Label>
            <Select
              id="filter-status"
              value={filters.statusCode || ''}
              onChange={(e) =>
                handleFilterChange('statusCode', e.target.value ? parseInt(e.target.value) : undefined)
              }
            >
              <option value="">All Status</option>
              {STATUS_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-path">Path (contains)</Label>
            <Input
              id="filter-path"
              placeholder="/api/v1/ai"
              value={filters.path || ''}
              onChange={(e) => handleFilterChange('path', e.target.value)}
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
                      IP Address
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Method
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Path
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Status
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Response Time
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      User Agent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs font-mono">
                        {log.ipAddress}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        <Badge variant="outline">{log.method}</Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        <span className="font-mono">{log.path}</span>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        <Badge variant={getStatusBadgeVariant(log.statusCode)}>
                          {log.statusCode}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {log.responseTime}ms
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                        {log.userAgent || '-'}
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

