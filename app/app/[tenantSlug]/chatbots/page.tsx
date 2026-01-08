'use client';

import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { getChatbots } from '@/lib/api/chatbots';
import type { Chatbot } from '@/lib/api/types';
import { Plus, Bot } from 'lucide-react';
import Link from 'next/link';

interface ChatbotsPageProps {
  params: { tenantSlug: string };
}

export default function ChatbotsPage({ params }: ChatbotsPageProps) {
  const { tenantSlug } = params;

  const { data: chatbotsData, isLoading } = useQuery({
    queryKey: ['chatbots', tenantSlug],
    queryFn: () => getChatbots({ limit: 100 }),
    enabled: !!tenantSlug,
  });

  const chatbots = chatbotsData?.data || [];

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chatbots</h1>
            <p className="text-muted-foreground">
              Manage your AI chatbots
            </p>
          </div>
          <Link href={`/app/${tenantSlug}/chatbots/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Chatbot
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
                  <div className="h-3 w-24 bg-gray-200 mb-2" />
                  <div className="h-3 w-16 bg-gray-200" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : chatbots.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Chatbots</CardTitle>
              <CardDescription>
                Get started by creating your first chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/app/${tenantSlug}/chatbots/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Chatbot
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chatbots.map((chatbot: Chatbot) => (
              <Card key={chatbot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      {chatbot.name}
                    </CardTitle>
                    <span
                      className={`px-2 py-1 text-xs ${
                        chatbot.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {chatbot.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {chatbot.description && (
                    <CardDescription>{chatbot.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Model: </span>
                      <span className="font-medium">{chatbot.aiModel}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temperature: </span>
                      <span className="font-medium">{chatbot.temperature}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/app/${tenantSlug}/chatbots/${chatbot.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

