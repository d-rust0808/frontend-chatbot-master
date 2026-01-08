'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createChatbot, getModels } from '@/lib/api/chatbots';
import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Select,
  Slider,
  Label,
} from '@/components/ui';

const chatbotSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  aiModel: z.string().min(1, 'AI Model is required'),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4000),
});

type ChatbotFormData = z.infer<typeof chatbotSchema>;

interface ChatbotNewPageProps {
  params: { tenantSlug: string };
}

export default function ChatbotNewPage({ params }: ChatbotNewPageProps) {
  const { tenantSlug } = params;
  const router = useRouter();

  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: () => getModels(),
  });

  const models = modelsData?.data;
  const recommendedModels = models?.recommended || [];
  const allModels = models?.all || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ChatbotFormData>({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      temperature: 0.7,
      maxTokens: 1000,
    },
  });

  const temperature = watch('temperature');
  const maxTokens = watch('maxTokens');

  const mutation = useMutation({
    mutationFn: createChatbot,
    onSuccess: () => {
      router.push(`/app/${tenantSlug}/chatbots`);
    },
  });

  const onSubmit = (data: ChatbotFormData) => {
    mutation.mutate(data);
  };

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Chatbot</h1>
          <p className="text-muted-foreground">
            Configure your new AI chatbot
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                General information about your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="My Chatbot"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="A helpful assistant for customer support"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>
                Configure the AI model and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiModel">AI Model *</Label>
                <Select
                  id="aiModel"
                  {...register('aiModel')}
                >
                  <option value="">Select a model</option>
                  {recommendedModels.length > 0 && (
                    <optgroup label="Recommended">
                      {recommendedModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {allModels.length > 0 && (
                    <optgroup label="All Models">
                      {allModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </Select>
                {errors.aiModel && (
                  <p className="text-sm text-destructive">
                    {errors.aiModel.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Temperature: {temperature}</Label>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) =>
                    setValue('temperature', parseFloat(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness. Lower = more focused, Higher = more creative.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Max Tokens: {maxTokens}</Label>
                <Slider
                  min={1}
                  max={4000}
                  step={100}
                  value={maxTokens}
                  onChange={(e) =>
                    setValue('maxTokens', parseInt(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum length of the AI response.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  {...register('systemPrompt')}
                  placeholder="You are a helpful assistant..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Instructions for the AI on how to behave.
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
              {mutation.isPending ? 'Creating...' : 'Create Chatbot'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

