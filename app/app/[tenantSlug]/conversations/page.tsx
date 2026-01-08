'use client';

import { useQuery } from '@tanstack/react-query';
import { getConversations } from '@/lib/api/conversations';
import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { Conversation } from '@/lib/api/types';

interface ConversationsPageProps {
  params: { tenantSlug: string };
}

export default function ConversationsPage({ params }: ConversationsPageProps) {
  const { tenantSlug } = params;

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations', tenantSlug],
    queryFn: () => getConversations(),
  });

  const conversations = conversationsData?.data || [];

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Conversations</h1>
          <p className="text-muted-foreground">
            View and manage all conversations
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 w-32 bg-gray-200" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Conversations</CardTitle>
              <CardDescription>
                Conversations will appear here when users interact with your chatbots
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation: Conversation) => (
              <Link
                key={conversation.id}
                href={`/app/${tenantSlug}/conversations/${conversation.id}`}
              >
                <Card className="hover:bg-gray-50 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {conversation.chatbot?.name || 'Unknown Chatbot'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {conversation.platform} • {conversation.chatId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            conversation.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {conversation.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

