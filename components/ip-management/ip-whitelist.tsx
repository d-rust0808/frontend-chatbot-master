'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Select,
  Label,
  Badge,
} from '@/components/ui';
import {
  useWhitelist,
  useAddToWhitelist,
  useRemoveFromWhitelist,
  useToggleWhitelistStatus,
} from '@/hooks/use-system-configs';
import type { IPEntry } from '@/lib/api/types';
import { isPaginationMeta } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';
import { useLoading } from '@/components/loading-provider';
import { useAlert } from '@/components/alert-provider';
import { AddIPModal } from './add-ip-modal';
import type { CreateIPEntryRequest } from '@/lib/api/types';

export function IPWhitelist() {
  const { withLoading } = useLoading();
  const { showAlert } = useAlert();

  const [page, setPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 50;

  const {
    data: whitelistData,
    isLoading,
    error,
  } = useWhitelist({
    page,
    limit,
    isActive: isActiveFilter,
  });

  const addMutation = useAddToWhitelist();
  const removeMutation = useRemoveFromWhitelist();
  const toggleMutation = useToggleWhitelistStatus();

  const handleAdd = async (data: CreateIPEntryRequest) => {
    try {
      await withLoading(addMutation.mutateAsync(data));
      showAlert({
        message: 'IP added to whitelist successfully',
        variant: 'success',
      });
    } catch (error: unknown) {
      showAlert({
        message: 'Failed to add IP to whitelist',
        description: getErrorMessage(error),
        variant: 'error',
        timeoutMs: 8000,
      });
      throw error;
    }
  };

  const handleRemove = async (ipAddress: string) => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Are you sure you want to remove IP ${ipAddress} from whitelist?`
    );
    if (!confirmed) return;

    try {
      await withLoading(removeMutation.mutateAsync(ipAddress));
      showAlert({
        message: 'IP removed from whitelist successfully',
        variant: 'success',
      });
    } catch (error: unknown) {
      showAlert({
        message: 'Failed to remove IP from whitelist',
        description: getErrorMessage(error),
        variant: 'error',
        timeoutMs: 8000,
      });
    }
  };

  const handleToggle = async (ipAddress: string, currentStatus: boolean) => {
    try {
      await withLoading(
        toggleMutation.mutateAsync({
          ipAddress,
          data: { isActive: !currentStatus },
        })
      );
      showAlert({
        message: `IP ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
        variant: 'success',
      });
    } catch (error: unknown) {
      showAlert({
        message: 'Failed to toggle IP status',
        description: getErrorMessage(error),
        variant: 'error',
        timeoutMs: 8000,
      });
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const isCIDR = (ip: string): boolean => ip.includes('/');

  const whitelist = whitelistData?.data ?? [];
  const meta = whitelistData?.meta && isPaginationMeta(whitelistData.meta) ? whitelistData.meta : null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>IP Whitelist</CardTitle>
              <CardDescription>
                Manage allowed IP addresses and CIDR ranges (priority over blacklist)
              </CardDescription>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Add to Whitelist</Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="whitelist-status-filter">Status</Label>
              <Select
                id="whitelist-status-filter"
                value={isActiveFilter === undefined ? 'all' : String(isActiveFilter)}
                onChange={(e) => {
                  const value = e.target.value;
                  setIsActiveFilter(
                    value === 'all' ? undefined : value === 'true'
                  );
                  setPage(1);
                }}
              >
                <option value="all">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading whitelist...</p>
          ) : error ? (
            <p className="text-sm text-destructive">
              Failed to load whitelist: {getErrorMessage(error)}
            </p>
          ) : whitelist.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-medium text-gray-900">No IPs in whitelist</p>
              <p className="text-xs text-muted-foreground">
                Add IPs to whitelist to allow them
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                        IP Address
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                        Reason
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                        Status
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                        Expires At
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                        Created At
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {whitelist.map((entry: IPEntry) => (
                      <tr key={entry.id} className="hover:bg-green-50">
                        <td className="border border-gray-200 px-4 py-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{entry.ipAddress}</span>
                            {isCIDR(entry.ipAddress) && (
                              <Badge variant="outline" className="text-xs">
                                CIDR
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-xs">
                          {entry.reason || '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-xs">
                          {entry.isActive ? (
                            <Badge variant="default" className="bg-green-600">
                              ✅ Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">⏸ Inactive</Badge>
                          )}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-xs">
                          {formatDate(entry.expiresAt)}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-xs">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggle(entry.ipAddress, entry.isActive)}
                              disabled={toggleMutation.isPending}
                            >
                              {entry.isActive ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemove(entry.ipAddress)}
                              disabled={removeMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
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
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AddIPModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        title="Add IP to Whitelist"
        submitLabel="Add to Whitelist"
      />
    </>
  );
}

