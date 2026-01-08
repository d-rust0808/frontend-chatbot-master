'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTenants } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
} from '@/components/ui';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import type { Tenant } from '@/lib/api/types';
import { useTenantsStore } from '@/lib/stores/tenants-store';

export default function AdminTenantsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    tenants,
    isLoading: storeLoading,
    pagination,
    setTenants,
    setLoading,
    setPagination,
  } = useTenantsStore();

  const { data: tenantsData, isLoading: queryLoading } = useQuery({
    queryKey: ['admin', 'tenants', { page, limit, search }],
    queryFn: () => getTenants({ page, limit, search: search || undefined }),
  });

  useEffect(() => {
    if (tenantsData) {
      setTenants(tenantsData.data || []);
      if (tenantsData.meta) {
        setPagination(tenantsData.meta);
      }
      setLoading(false);
    }
  }, [tenantsData, setTenants, setPagination, setLoading]);

  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading, setLoading]);

  const isLoading = storeLoading || queryLoading;
  const meta = pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground">
            Manage all tenants in the system
          </p>
        </div>
        <Link href="/admin/tenants/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Customer
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant List</CardTitle>
          <CardDescription>
            Search and manage all tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or slug..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tenants found
            </div>
          ) : (
            <div className="space-y-2">
              {tenants.map((tenant: Tenant) => (
                <Link
                  key={tenant.id}
                  href={`/admin/tenants/${tenant.id}`}
                  className="flex items-center justify-between p-4 border hover:bg-gray-50 block transition-all duration-200"
                >
                  <div>
                    <div className="font-medium">{tenant.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {tenant.slug}
                    </div>
                    {tenant._count && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {tenant._count.chatbots || 0} chatbot(s),{' '}
                        {tenant._count.conversations || 0} conversation(s)
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {tenants.length > 0 && meta && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <Button
                variant="outline"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

