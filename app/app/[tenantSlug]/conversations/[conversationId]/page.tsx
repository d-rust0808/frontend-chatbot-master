'use client';

import { useQuery } from '@tanstack/react-query';
import { getConversation, getMessages } from '@/lib/api/conversations';
import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Message } from '@/lib/api/types';

interface ConversationDetailPageProps {
  params: { tenantSlug: string; conversationId: string };
}

export default function ConversationDetailPage({
  params,
}: ConversationDetailPageProps) {
  const { tenantSlug, conversationId } = params;

  const { data: conversationData } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId),
  });

  const { data: messagesData } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
  });

  const conversation = conversationData?.data;
  const messages = messagesData?.data || [];

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/app/${tenantSlug}/conversations`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {conversation?.chatbot?.name || 'Conversation'}
            </h1>
            <p className="text-muted-foreground">
              {conversation?.platform} • {conversation?.chatId}
            </p>
          </div>
          {conversation && (
            <Badge
              variant={
                conversation.status === 'active' ? 'default' : 'secondary'
              }
            >
              {conversation.status}
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No messages yet
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 transition-all duration-200 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.role === 'user'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

