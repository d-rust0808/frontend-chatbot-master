'use client';

import { useQuery } from '@tanstack/react-query';
import { getConnections } from '@/lib/api/platforms';
import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@/components/ui';
import { Plus, Activity } from 'lucide-react';
import Link from 'next/link';
import type { PlatformConnection } from '@/lib/api/types';

interface PlatformsPageProps {
  params: { tenantSlug: string };
}

export default function PlatformsPage({ params }: PlatformsPageProps) {
  const { tenantSlug } = params;

  const { data: connectionsData, isLoading } = useQuery({
    queryKey: ['platforms', 'connections', tenantSlug],
    queryFn: () => getConnections(),
  });

  const connections = connectionsData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'disconnected':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Connections</h1>
            <p className="text-muted-foreground">
              Manage your platform integrations
            </p>
          </div>
          <Link href={`/app/${tenantSlug}/platforms/connect`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connect Platform
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 w-32 bg-gray-200" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 w-24 bg-gray-200" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : connections.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Connections</CardTitle>
              <CardDescription>
                Connect your first platform to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/app/${tenantSlug}/platforms/connect`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Connect Platform
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection: PlatformConnection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      {connection.platform}
                    </CardTitle>
                    <Badge variant={getStatusColor(connection.status)}>
                      {connection.status}
                    </Badge>
                  </div>
                  {connection.chatbot && (
                    <CardDescription>
                      {connection.chatbot.name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {connection.lastSyncAt && (
                    <p className="text-sm text-muted-foreground">
                      Last sync: {new Date(connection.lastSyncAt).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

