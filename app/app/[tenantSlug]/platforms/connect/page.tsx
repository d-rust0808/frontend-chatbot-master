'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { connectPlatform } from '@/lib/api/platforms';
import { getChatbots } from '@/lib/api/chatbots';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, Button, Select, Textarea, Label, CardDescription } from '@/components/ui';

const connectSchema = z.object({
  chatbotId: z.string().min(1, 'Chatbot is required'),
  platform: z.string().min(1, 'Platform is required'),
  credentials: z.string().min(1, 'Credentials are required'),
  options: z.string().optional(),
});

type ConnectFormData = z.infer<typeof connectSchema>;

interface ConnectPlatformPageProps {
  params: { tenantSlug: string };
}

const PLATFORMS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook Messenger' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'zalo', label: 'Zalo' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'lazada', label: 'Lazada' },
];

const PLATFORM_CONFIG: Record<
  string,
  {
    description: string;
    credentialsExample: string;
    optionsExample?: string;
  }
> = {
  whatsapp: {
    description: 'Connect via WhatsApp Business API (Cloud or On-premise).',
    credentialsExample:
      '{"phoneNumberId": "...", "businessAccountId": "...", "accessToken": "..."}',
    optionsExample:
      '{"webhookUrl": "https://your-domain.com/webhooks/whatsapp", "verifyToken": "..."}',
  },
  facebook: {
    description: 'Connect Facebook Messenger through a Facebook App + Page.',
    credentialsExample:
      '{"pageId": "...", "appId": "...", "appSecret": "...", "pageAccessToken": "..."}',
    optionsExample:
      '{"webhookUrl": "https://your-domain.com/webhooks/facebook", "verifyToken": "..."}',
  },
  instagram: {
    description: 'Use the Instagram Messaging API via a Facebook App.',
    credentialsExample:
      '{"instagramBusinessId": "...", "appId": "...", "appSecret": "...", "accessToken": "..."}',
  },
  tiktok: {
    description: 'Connect TikTok Business/Shop messaging webhooks.',
    credentialsExample:
      '{"appKey": "...", "appSecret": "...", "accessToken": "..."}',
    optionsExample:
      '{"webhookUrl": "https://your-domain.com/webhooks/tiktok", "eventTypes": ["message"]}',
  },
  zalo: {
    description: 'Zalo OA (Official Account) messaging integration.',
    credentialsExample:
      '{"oaId": "...", "oaSecretKey": "...", "accessToken": "..."}',
  },
  shopee: {
    description: 'Shopee chat & order notifications via Shopee Open Platform.',
    credentialsExample:
      '{"partnerId": 0, "partnerKey": "...", "shopId": 0, "accessToken": "..."}',
  },
  lazada: {
    description: 'Lazada chat/order events via Open Platform.',
    credentialsExample:
      '{"appKey": "...", "appSecret": "...", "accessToken": "..."}',
  },
};

export default function ConnectPlatformPage({ params }: ConnectPlatformPageProps) {
  const { tenantSlug } = params;
  const router = useRouter();

  const { data: chatbotsData } = useQuery({
    queryKey: ['chatbots', tenantSlug],
    queryFn: () => getChatbots({ limit: 100 }),
  });

  const chatbots = chatbotsData?.data || [];

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ConnectFormData>({
    resolver: zodResolver(connectSchema),
  });

  const selectedPlatform = watch('platform');
  const options = watch('options');

  const mutation = useMutation({
    mutationFn: (data: ConnectFormData) =>
      connectPlatform({
        chatbotId: data.chatbotId,
        platform: data.platform,
        credentials: JSON.parse(data.credentials),
        options: options ? JSON.parse(options) : undefined,
      }),
    onSuccess: () => {
      router.push(`/app/${tenantSlug}/platforms`);
    },
  });

  const onSubmit = (data: ConnectFormData) => {
    try {
      // Validate JSON
      JSON.parse(data.credentials);
      if (data.options) {
        JSON.parse(data.options);
      }
      mutation.mutate(data);
    } catch (error) {
      // Error will be caught by form validation
    }
  };

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Connect Platform</h1>
          <p className="text-muted-foreground">
            Connect a platform to your chatbot
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Details</CardTitle>
              <CardDescription>
                Select chatbot and platform to connect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chatbotId">Chatbot *</Label>
                <Select id="chatbotId" {...register('chatbotId')}>
                  <option value="">Select a chatbot</option>
                  {chatbots.map((chatbot) => (
                    <option key={chatbot.id} value={chatbot.id}>
                      {chatbot.name}
                    </option>
                  ))}
                </Select>
                {errors.chatbotId && (
                  <p className="text-sm text-destructive">
                    {errors.chatbotId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select id="platform" {...register('platform')}>
                  <option value="">Select a platform</option>
                  {PLATFORMS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </Select>
                {errors.platform && (
                  <p className="text-sm text-destructive">
                    {errors.platform.message}
                  </p>
                )}
              </div>

              {selectedPlatform && PLATFORM_CONFIG[selectedPlatform] && (
                <div className="rounded-md border bg-muted/40 p-4 text-xs space-y-2">
                  <p className="font-medium text-muted-foreground">
                    {PLATFORM_CONFIG[selectedPlatform].description}
                  </p>
                  <div className="space-y-1">
                    <p className="font-semibold">Credentials example</p>
                    <pre className="whitespace-pre-wrap rounded bg-background p-2 font-mono text-[11px]">
                      {PLATFORM_CONFIG[selectedPlatform].credentialsExample}
                    </pre>
                  </div>
                  {PLATFORM_CONFIG[selectedPlatform].optionsExample && (
                    <div className="space-y-1">
                      <p className="font-semibold">Options example</p>
                      <pre className="whitespace-pre-wrap rounded bg-background p-2 font-mono text-[11px]">
                        {PLATFORM_CONFIG[selectedPlatform].optionsExample}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="credentials">Credentials (JSON) *</Label>
                <Textarea
                  id="credentials"
                  {...register('credentials')}
                  placeholder='{"apiKey": "your-api-key", "apiSecret": "your-secret"}'
                  rows={8}
                  className="font-mono text-sm"
                />
                {errors.credentials && (
                  <p className="text-sm text-destructive">
                    {errors.credentials.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter platform credentials as JSON. Check platform documentation for required fields.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="options">Options (JSON, optional)</Label>
                <Textarea
                  id="options"
                  {...register('options')}
                  placeholder='{"webhookUrl": "https://...", "autoReply": true}'
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Additional platform-specific options as JSON.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Connecting...' : 'Connect Platform'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

