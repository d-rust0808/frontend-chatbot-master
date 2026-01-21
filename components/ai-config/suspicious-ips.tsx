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
  Badge,
} from '@/components/ui';
import { useSuspiciousIPs } from '@/hooks/use-system-configs';
import type { GetAILogsSuspiciousIPsParams } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useLoading } from '@/components/loading-provider';

const DEFAULT_THRESHOLD = 100;

export function SuspiciousIPs() {
  const { withLoading } = useLoading();

  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [filters, setFilters] = useState<GetAILogsSuspiciousIPsParams>({
    threshold: DEFAULT_THRESHOLD,
  });

  const {
    data: suspiciousIPsData,
    isLoading,
    error,
    refetch,
  } = useSuspiciousIPs(filters);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, threshold }));
  }, [threshold]);

  const handleRefresh = async () => {
    await withLoading(refetch());
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const suspiciousIPs = suspiciousIPsData?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Suspicious IPs
            </CardTitle>
            <CardDescription>
              IP addresses making excessive AI API requests
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Threshold Filter */}
        <div className="mb-6 space-y-2">
          <Label htmlFor="threshold">Request Threshold</Label>
          <div className="flex items-center gap-4">
            <Input
              id="threshold"
              type="number"
              min="1"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || DEFAULT_THRESHOLD)}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              IPs with more than {threshold} requests will be shown
            </span>
          </div>
        </div>

        {/* Suspicious IPs Table */}
        {isLoading && !suspiciousIPs.length ? (
          <p className="text-sm text-muted-foreground">Loading suspicious IPs...</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            Failed to load suspicious IPs: {getErrorMessage(error)}
          </p>
        ) : suspiciousIPs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm font-medium text-gray-900">No suspicious IPs found</p>
            <p className="text-xs text-muted-foreground">
              All IPs are within normal usage patterns
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                    IP Address
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                    Request Count
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                    Total Tokens
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                    Total Cost
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                    Time Window
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                    Providers
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                    Models
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                    First Request
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                    Last Request
                  </th>
                </tr>
              </thead>
              <tbody>
                {suspiciousIPs.map((item) => (
                  <tr key={item.ipAddress} className="hover:bg-red-50">
                    <td className="border border-gray-200 px-4 py-3 text-xs font-mono font-medium text-red-600">
                      {item.ipAddress}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-xs">
                      <Badge variant="destructive">{item.requestCount}</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-xs">
                      {item.totalTokens.toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-xs font-medium text-red-600">
                      ${item.totalCost.toFixed(2)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-xs">
                      {item.timeWindow}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {item.providers.map((provider) => (
                          <Badge key={provider} variant="outline" className="text-xs">
                            {provider}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {item.models.slice(0, 3).map((model) => (
                          <Badge key={model} variant="secondary" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                        {item.models.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.models.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(item.firstRequestAt)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(item.lastRequestAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

