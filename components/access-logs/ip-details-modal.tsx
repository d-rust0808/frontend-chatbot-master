'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { X } from 'lucide-react';
import { useIPDetails } from '@/hooks/use-system-configs';
import type { IPDetails } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';

interface IPDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ipAddress: string;
}

export function IPDetailsModal({ isOpen, onClose, ipAddress }: IPDetailsModalProps) {
  const {
    data: detailsData,
    isLoading,
    error,
  } = useIPDetails(ipAddress, {
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  });

  if (!isOpen) return null;

  const details: IPDetails | undefined = detailsData?.data;
  const successRate = details
    ? ((details.successCount / details.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>IP Details: {ipAddress}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading IP details...</p>
          ) : error ? (
            <p className="text-sm text-destructive">
              Failed to load IP details: {getErrorMessage(error)}
            </p>
          ) : !details ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Status:</span>
                {details.isBlacklisted ? (
                  <Badge variant="destructive">Blacklisted</Badge>
                ) : details.isWhitelisted ? (
                  <Badge variant="default" className="bg-green-600">
                    Whitelisted
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Listed</Badge>
                )}
              </div>

              {/* Statistics */}
              <div>
                <h3 className="mb-3 text-sm font-medium">Statistics (Last 24h)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="text-xs text-muted-foreground">Total Requests</div>
                    <div className="text-2xl font-bold">{details.totalRequests.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                    <div className="text-2xl font-bold text-green-600">{successRate}%</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="text-xs text-muted-foreground">Error Rate</div>
                    <div className="text-2xl font-bold text-red-600">
                      {details.errorCount > 0
                        ? ((details.errorCount / details.totalRequests) * 100).toFixed(1)
                        : '0'}
                      %
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="text-xs text-muted-foreground">Avg Response Time</div>
                    <div className="text-2xl font-bold">{details.avgResponseTime}ms</div>
                  </div>
                </div>
              </div>

              {/* Methods */}
              <div>
                <h3 className="mb-2 text-sm font-medium">HTTP Methods</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(details.methods).map(([method, count]) => (
                    <Badge key={method} variant="outline">
                      {method}: {count.toLocaleString()}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status Codes */}
              <div>
                <h3 className="mb-2 text-sm font-medium">Status Codes</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(details.statusCodes)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([code, count]) => (
                      <Badge
                        key={code}
                        variant={
                          parseInt(code) >= 400 ? 'destructive' : 'default'
                        }
                      >
                        {code}: {count.toLocaleString()}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Top Paths */}
              <div>
                <h3 className="mb-2 text-sm font-medium">Top Paths</h3>
                <div className="space-y-1">
                  {details.paths.slice(0, 10).map((pathItem, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded border border-gray-200 bg-white p-2 text-xs"
                    >
                      <span className="font-mono">{pathItem.path}</span>
                      <Badge variant="outline">{pathItem.count.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

