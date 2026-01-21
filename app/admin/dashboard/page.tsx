'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardStats, getUsers } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { Users, Building2, Bot, MessageSquare, Activity, Package, CreditCard, Database } from 'lucide-react';

export default function AdminDashboardPage() {
  // Try to get admin stats, but handle 403 gracefully
  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: () => getAdminDashboardStats(),
    retry: false,
  });

  // Get users count as fallback
  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users', { page: 1, limit: 1 }],
    queryFn: () => getUsers({ page: 1, limit: 1 }),
    retry: false,
  });

  const stats = statsData?.data;
  const hasStats = stats && !statsError;

  // Get total users from users query if available
  const totalUsers = usersData?.meta && 'total' in usersData.meta 
    ? usersData.meta.total 
    : usersData?.data?.length || 0;

  const statCards = [
    {
      title: 'Total Users',
      value: hasStats ? (stats?.users?.total || 0) : totalUsers,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Total Tenants',
      value: hasStats ? (stats?.tenants?.total || 0) : '-',
      icon: Building2,
      description: 'Active tenants',
    },
    {
      title: 'Total Chatbots',
      value: hasStats ? (stats?.chatbots?.total || 0) : '-',
      icon: Bot,
      description: 'All chatbots',
    },
    {
      title: 'Active Conversations',
      value: hasStats ? (stats?.conversations?.total || 0) : '-',
      icon: MessageSquare,
      description: 'Ongoing conversations',
    },
    {
      title: 'Platform Connections',
      value: hasStats ? (stats?.platformConnections?.active || 0) : '-',
      icon: Activity,
      description: 'Active connections',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System overview and statistics
        </p>
      </div>

      {isLoadingStats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-24 bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {statsError && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">Stats Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">
              Statistics API is not available. Some metrics may be limited.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/users"
              className="flex items-center gap-2 rounded-lg border p-3 transition hover:bg-gray-50"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Manage Users</span>
            </a>
            <a
              href="/admin/tenants"
              className="flex items-center gap-2 rounded-lg border p-3 transition hover:bg-gray-50"
            >
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-medium">Manage Tenants</span>
            </a>
            <a
              href="/admin/service-packages"
              className="flex items-center gap-2 rounded-lg border p-3 transition hover:bg-gray-50"
            >
              <Package className="h-5 w-5 text-primary" />
              <span className="font-medium">Service Packages</span>
            </a>
            <a
              href="/admin/payments"
              className="flex items-center gap-2 rounded-lg border p-3 transition hover:bg-gray-50"
            >
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-medium">Payments</span>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">Admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Access Level:</span>
                <span className="font-medium">Tenant Management</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

