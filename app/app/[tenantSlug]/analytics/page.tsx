'use client';

import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

interface AnalyticsPageProps {
  params: { tenantSlug: string };
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            View insights and metrics for your chatbots
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>
              Charts and metrics coming soon...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analytics dashboard with charts will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

