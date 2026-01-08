'use client';

import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

interface SettingsPageProps {
  params: { tenantSlug: string };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your tenant settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tenant Settings</CardTitle>
            <CardDescription>
              Configure your tenant preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Settings page coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

