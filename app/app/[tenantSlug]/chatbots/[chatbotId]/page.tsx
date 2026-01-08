'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getChatbot } from '@/lib/api/chatbots';
import type { Chatbot } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

interface ChatbotDetailPageProps {
  params: { tenantSlug: string; chatbotId: string };
}

export default function ChatbotDetailPage({ params }: ChatbotDetailPageProps) {
  const { tenantSlug, chatbotId } = params;
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['chatbot', chatbotId],
    queryFn: () => getChatbot(chatbotId),
    enabled: !!chatbotId,
  });

  const chatbot: Chatbot | undefined = data?.data;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chatbot details</h1>
            <p className="text-muted-foreground">
              View configuration and status for this chatbot.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        {isLoading && (
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-40 bg-gray-200" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-4 w-32 bg-gray-200" />
              <div className="h-4 w-24 bg-gray-200" />
            </CardContent>
          </Card>
        )}

        {error && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Unable to load chatbot</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                There was a problem loading this chatbot. Please try again.
              </p>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" onClick={() => router.push(`/app/${tenantSlug}/chatbots`)}>
                  Back to list
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && chatbot && (
          <Card>
            <CardHeader>
              <CardTitle>{chatbot.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {chatbot.description && (
                <p className="text-muted-foreground">{chatbot.description}</p>
              )}
              <div>
                <span className="text-muted-foreground">Model: </span>
                <span className="font-medium">{chatbot.aiModel}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Temperature: </span>
                <span className="font-medium">{chatbot.temperature}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max tokens: </span>
                <span className="font-medium">{chatbot.maxTokens}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status: </span>
                <span className="font-medium">
                  {chatbot.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}


