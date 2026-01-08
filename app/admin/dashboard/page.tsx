'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { Users, Building2, Bot, MessageSquare, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => getAdminStats(),
  });

  const stats = statsData?.data;

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Total Tenants',
      value: stats?.tenants.total || 0,
      icon: Building2,
      description: 'Active tenants',
    },
    {
      title: 'Total Chatbots',
      value: stats?.chatbots.total || 0,
      icon: Bot,
      description: 'All chatbots',
    },
    {
      title: 'Active Conversations',
      value: stats?.conversations.total || 0,
      icon: MessageSquare,
      description: 'Ongoing conversations',
    },
    {
      title: 'Platform Connections',
      value: stats?.platformConnections.active || 0,
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

      {isLoading ? (
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Activity feed coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

