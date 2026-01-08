'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
} from '@/components/ui';
import { Search } from 'lucide-react';
import type { User } from '@/lib/api/types';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, limit, search }],
    queryFn: () => getUsers({ page, limit, search: search || undefined }),
  });

  const users = usersData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage system users
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            Search and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
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
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border hover:bg-gray-50 transition-all duration-200"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    {user._count && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {user._count.tenants || 0} tenant(s)
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {users.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                disabled={users.length < limit}
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

