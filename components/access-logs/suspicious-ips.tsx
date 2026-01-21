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
import {
  useAccessLogSuspiciousIPs,
  useBanIPFromSuspicious,
} from '@/hooks/use-system-configs';
import type { GetSuspiciousIPsParams as GetAccessLogSuspiciousIPsParams } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';
import { useLoading } from '@/components/loading-provider';
import { useAlert } from '@/components/alert-provider';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { BanIPModal } from './ban-ip-modal';
import type { SuspiciousIP as AccessLogSuspiciousIP } from '@/lib/api/types';

const DEFAULT_MIN_RISK_SCORE = 30;

export function SuspiciousIPs() {
  const { withLoading } = useLoading();
  const { showAlert } = useAlert();

  const [minRiskScore, setMinRiskScore] = useState(DEFAULT_MIN_RISK_SCORE);
  const [filters, setFilters] = useState<GetAccessLogSuspiciousIPsParams>({
    minRiskScore: DEFAULT_MIN_RISK_SCORE,
  });
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedIP, setSelectedIP] = useState<AccessLogSuspiciousIP | null>(null);

  const {
    data: suspiciousIPsData,
    isLoading,
    error,
    refetch,
  } = useAccessLogSuspiciousIPs(filters);

  const banMutation = useBanIPFromSuspicious();

  useEffect(() => {
    setFilters((prev) => ({ ...prev, minRiskScore }));
  }, [minRiskScore]);

  const handleRefresh = async () => {
    await withLoading(refetch());
  };

  const handleBanClick = (ip: AccessLogSuspiciousIP) => {
    setSelectedIP(ip);
    setBanModalOpen(true);
  };

  const handleBan = async (reason?: string, expiresAt?: string) => {
    if (!selectedIP) return;

    try {
      await withLoading(
        banMutation.mutateAsync({
          ipAddress: selectedIP.ipAddress,
          data: { reason, expiresAt },
        })
      );
      showAlert({
        message: 'IP banned successfully',
        variant: 'success',
      });
      setBanModalOpen(false);
      setSelectedIP(null);
      refetch();
    } catch (error: unknown) {
      showAlert({
        message: 'Failed to ban IP',
        description: getErrorMessage(error),
        variant: 'error',
        timeoutMs: 8000,
      });
    }
  };

  const getRiskBadgeVariant = (riskScore: number): 'default' | 'destructive' | 'secondary' => {
    if (riskScore >= 70) return 'destructive';
    if (riskScore >= 50) return 'secondary';
    return 'default';
  };

  const getRiskBadgeColor = (riskScore: number): string => {
    if (riskScore >= 70) return '🔴';
    if (riskScore >= 50) return '🟡';
    return '🟢';
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'ban':
        return <Badge variant="destructive">⚠️ Ban Recommended</Badge>;
      case 'monitor':
        return <Badge variant="secondary">👁️ Monitor</Badge>;
      default:
        return <Badge variant="default">✅ Safe</Badge>;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const suspiciousIPs = suspiciousIPsData?.data ?? [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Suspicious IPs Detection
              </CardTitle>
              <CardDescription>
                Automatically detected IPs with suspicious activity patterns
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
          {/* Risk Score Filter */}
          <div className="mb-6 space-y-2">
            <Label htmlFor="min-risk-score">Minimum Risk Score</Label>
            <div className="flex items-center gap-4">
              <Input
                id="min-risk-score"
                type="number"
                min="0"
                max="100"
                value={minRiskScore}
                onChange={(e) => setMinRiskScore(parseInt(e.target.value) || DEFAULT_MIN_RISK_SCORE)}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                IPs with risk score ≥ {minRiskScore} will be shown
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
                      Risk Score
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Requests
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Req/Min
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Error Rate
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Failed Auth
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Recommendation
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Last Request
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {suspiciousIPs.map((ip) => (
                    <tr key={ip.ipAddress} className="hover:bg-red-50">
                      <td className="border border-gray-200 px-4 py-3 text-xs font-mono font-medium text-red-600">
                        {ip.ipAddress}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        <Badge variant={getRiskBadgeVariant(ip.riskScore)}>
                          {getRiskBadgeColor(ip.riskScore)} {ip.riskScore}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {ip.requestCount.toLocaleString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {ip.requestsPerMinute.toFixed(1)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {ip.errorRate.toFixed(1)}%
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {ip.failedAuthCount}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {getRecommendationBadge(ip.recommendation)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(ip.lastRequestAt)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleBanClick(ip)}
                            disabled={banMutation.isPending}
                          >
                            Ban
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedIP && (
        <BanIPModal
          isOpen={banModalOpen}
          onClose={() => {
            setBanModalOpen(false);
            setSelectedIP(null);
          }}
          onBan={handleBan}
          ipAddress={selectedIP.ipAddress}
          riskScore={selectedIP.riskScore}
          suspiciousFactors={selectedIP.suspiciousFactors}
        />
      )}
    </>
  );
}

