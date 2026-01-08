'use client';

import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { getChatbots } from '@/lib/api/chatbots';
import type { Chatbot } from '@/lib/api/types';
import { MessageSquare, Bot, Activity } from 'lucide-react';

interface DashboardPageProps {
  params: { tenantSlug: string };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { tenantSlug } = params;

  const { data: chatbotsData, isLoading } = useQuery({
    queryKey: ['chatbots', tenantSlug],
    queryFn: () => getChatbots({ limit: 100 }),
    enabled: !!tenantSlug,
  });

  const chatbots = chatbotsData?.data || [];
  const activeChatbots = chatbots.filter((c: Chatbot) => c.isActive).length;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your chatbot system
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Chatbots
                </CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chatbots.length}</div>
                <p className="text-xs text-muted-foreground">
                  All chatbots in your system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Chatbots
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeChatbots}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active chatbots
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversations
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Total conversations (coming soon)
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && chatbots.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Chatbots Yet</CardTitle>
              <CardDescription>
                Get started by creating your first chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={`/app/${tenantSlug}/chatbots/new`}
                className="inline-flex items-center justify-center bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
              >
                Create Chatbot
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

