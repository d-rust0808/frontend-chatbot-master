'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminConnectPlatformPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/platforms">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Connect Platform</h1>
          <p className="text-muted-foreground">
            Connect a new platform to start configuring chatbots.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Connection</CardTitle>
          <CardDescription>
            Platform connection configuration coming soon...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will allow you to connect and configure platforms like WhatsApp, Messenger, TikTok, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

