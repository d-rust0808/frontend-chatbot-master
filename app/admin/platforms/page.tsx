'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getConnections } from '@/lib/api/platforms';
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

export default function AdminPlatformsPage() {
  const searchParams = useSearchParams();
  const serviceFilter = searchParams.get('service');

  const { data: connectionsData, isLoading } = useQuery({
    queryKey: ['admin', 'platforms', 'connections', serviceFilter],
    queryFn: () => getConnections(),
  });

  const connections = connectionsData?.data || [];
  const filteredConnections = serviceFilter
    ? connections.filter((conn) => conn.platform === serviceFilter)
    : connections;

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platforms Configuration</h1>
          <p className="text-muted-foreground">
            Configure and manage platform connections for chatbots.
            {serviceFilter && (
              <span className="ml-2 font-medium">Filter: {serviceFilter}</span>
            )}
          </p>
        </div>
        <Link href="/admin/platforms/connect">
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
      ) : filteredConnections.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No platform connections</CardTitle>
            <CardDescription>
              {serviceFilter
                ? `No connections found for ${serviceFilter}.`
                : 'Get started by connecting a platform.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/platforms/connect">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Connect Your First Platform
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConnections.map((connection: PlatformConnection) => (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{connection.platform}</CardTitle>
                  <Badge variant={getStatusColor(connection.status)}>
                    {connection.status}
                  </Badge>
                </div>
                <CardDescription>
                  {connection.chatbot?.name || `Chatbot ID: ${connection.chatbotId}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {connection.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      Last sync:{' '}
                      {new Date(connection.lastSyncAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                  {connection.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      Created:{' '}
                      {new Date(connection.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

