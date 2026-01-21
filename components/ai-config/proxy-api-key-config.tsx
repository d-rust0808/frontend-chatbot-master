'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
} from '@/components/ui';
import {
  updateSystemConfig,
} from '@/lib/api/admin';
import { useSystemConfig, SYSTEM_CONFIG_QUERY_KEY } from '@/hooks/use-system-configs';
import { useLoading } from '@/components/loading-provider';
import { useAlert } from '@/components/alert-provider';
import { getErrorMessage } from '@/lib/utils';

const PROXY_API_KEY_CATEGORY = 'ai';
const PROXY_API_KEY = 'ai.proxy_api_key';

const updateApiKeySchema = z.object({
  value: z.string().min(1, 'API Key is required'),
});

type UpdateApiKeyFormData = z.infer<typeof updateApiKeySchema>;

export function ProxyAPIKeyConfig() {
  const queryClient = useQueryClient();
  const { withLoading } = useLoading();
  const { showAlert } = useAlert();

  const {
    data: configData,
    isLoading,
    error,
  } = useSystemConfig(PROXY_API_KEY_CATEGORY, PROXY_API_KEY);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateApiKeyFormData>({
    resolver: zodResolver(updateApiKeySchema),
    defaultValues: {
      value: '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateApiKeyFormData) => {
      return withLoading(
        updateSystemConfig(PROXY_API_KEY_CATEGORY, PROXY_API_KEY, {
          value: data.value,
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SYSTEM_CONFIG_QUERY_KEY(PROXY_API_KEY_CATEGORY, PROXY_API_KEY),
      });
      showAlert({
        message: 'Proxy API Key updated successfully',
        variant: 'success',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error);
      showAlert({
        message: 'Failed to update Proxy API Key',
        description: errorMessage,
        variant: 'error',
        timeoutMs: 8000,
      });
    },
  });

  const onSubmit = (data: UpdateApiKeyFormData) => {
    updateMutation.mutate(data);
  };

  const maskAPIKey = (key: string): string => {
    if (!key || key.length <= 8) return key;
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  const currentValue = configData?.data?.value as string | undefined;
  const displayValue = currentValue ? maskAPIKey(currentValue) : '';

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading API Key...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Failed to load API Key: {getErrorMessage(error)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proxy API Key Configuration</CardTitle>
        <CardDescription>
          Configure Proxy API Key for v98store. This key is used to call AI APIs through the proxy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">
              API Key
              <span className="ml-2 text-xs text-muted-foreground">
                (Masked for security)
              </span>
            </Label>
            {currentValue && (
              <div className="mb-2 rounded bg-muted p-2 text-sm">
                <span className="font-medium text-muted-foreground">Current: </span>
                <span className="font-mono">{displayValue}</span>
              </div>
            )}
            <Input
              id="api-key"
              type="password"
              placeholder="sk-xxxxx...xxxxx"
              {...register('value')}
              className="font-mono"
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the full API key. It will be masked when displayed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
            >
              {isSubmitting || updateMutation.isPending
                ? 'Saving...'
                : 'Save API Key'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

