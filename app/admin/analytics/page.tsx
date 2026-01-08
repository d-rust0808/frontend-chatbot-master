'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          System-wide analytics and reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Analytics</CardTitle>
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
  );
}

