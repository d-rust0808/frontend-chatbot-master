'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Badge,
} from '@/components/ui';
import {
  useAIModels,
  useCreateAIModel,
  useUpdateAIModel,
  useDeleteAIModel,
} from '@/hooks/use-system-configs';
import type { AIModelConfig, AIModelProvider, AIModelCategory } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/utils';
import { useLoading } from '@/components/loading-provider';
import { useAlert } from '@/components/alert-provider';

const aiModelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be max 100 characters'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().min(1, 'Description is required'),
  provider: z.enum(['openai', 'gemini', 'deepseek']),
  category: z.enum(['budget', 'balanced', 'premium']),
  recommended: z.boolean().default(false),
  modelRatio: z.number().min(0).default(1.0),
  outputRatio: z.number().min(0).default(1.0),
  cacheRatio: z.number().min(0).default(0.5),
  cacheCreationRatio: z.number().min(0).default(0.5),
  groupRatio: z.number().min(0).default(1.0),
  promptPrice: z.number().min(0, 'Prompt price must be >= 0'),
  completionPrice: z.number().min(0, 'Completion price must be >= 0'),
  cachePrice: z.number().min(0).default(0),
  cacheCreationPrice: z.number().min(0).default(0),
  aliases: z.string().optional(),
});

type AIModelFormData = z.infer<typeof aiModelSchema>;

const PROVIDER_OPTIONS: Array<{ value: AIModelProvider; label: string }> = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'deepseek', label: 'DeepSeek' },
];

const CATEGORY_OPTIONS: Array<{ value: AIModelCategory; label: string }> = [
  { value: 'budget', label: 'Budget' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'premium', label: 'Premium' },
];

export default function SpAdminAIModelsPage() {
  const { withLoading } = useLoading();
  const { showAlert } = useAlert();
  const [editingModel, setEditingModel] = useState<AIModelConfig | null>(null);

  const {
    data: modelsData,
    isLoading,
    error,
  } = useAIModels();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AIModelFormData>({
    resolver: zodResolver(aiModelSchema),
    defaultValues: {
      provider: 'openai',
      category: 'budget',
      recommended: false,
      modelRatio: 1.0,
      outputRatio: 1.0,
      cacheRatio: 0.5,
      cacheCreationRatio: 0.5,
      groupRatio: 1.0,
      cachePrice: 0,
      cacheCreationPrice: 0,
    },
  });

  const createMutation = useCreateAIModel();
  const updateMutation = useUpdateAIModel();
  const deleteMutation = useDeleteAIModel();

  const handleEditClick = (model: AIModelConfig) => {
    setEditingModel(model);
    setValue('name', model.name);
    setValue('displayName', model.displayName);
    setValue('description', model.description);
    setValue('provider', model.provider);
    setValue('category', model.category);
    setValue('recommended', model.recommended);
    setValue('modelRatio', model.modelRatio);
    setValue('outputRatio', model.outputRatio);
    setValue('cacheRatio', model.cacheRatio);
    setValue('cacheCreationRatio', model.cacheCreationRatio);
    setValue('groupRatio', model.groupRatio);
    setValue('promptPrice', model.promptPrice);
    setValue('completionPrice', model.completionPrice);
    setValue('cachePrice', model.cachePrice);
    setValue('cacheCreationPrice', model.cacheCreationPrice);
    setValue('aliases', model.aliases?.join(', ') || '');
  };

  const handleCancelEdit = () => {
    setEditingModel(null);
    reset();
  };

  const handleDelete = async (name: string) => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Are you sure you want to delete model "${name}"?`
    );
    if (!confirmed) return;

    try {
      await withLoading(deleteMutation.mutateAsync(name));
      showAlert({
        message: 'AI Model deleted successfully',
        variant: 'success',
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      showAlert({
        message: 'Failed to delete AI Model',
        description: errorMessage,
        variant: 'error',
        timeoutMs: 8000,
      });
    }
  };

  const onSubmit = async (data: AIModelFormData) => {
    try {
      const aliasesArray = data.aliases
        ? data.aliases.split(',').map((a) => a.trim()).filter(Boolean)
        : undefined;

      const modelData = {
        ...data,
        aliases: aliasesArray,
      };

      if (editingModel) {
        await withLoading(
          updateMutation.mutateAsync({
            name: editingModel.name,
            data: modelData,
          })
        );
        showAlert({
          message: 'AI Model updated successfully',
          variant: 'success',
        });
      } else {
        await withLoading(createMutation.mutateAsync(modelData));
        showAlert({
          message: 'AI Model created successfully',
          variant: 'success',
        });
      }
      setEditingModel(null);
      reset();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      showAlert({
        message: editingModel ? 'Failed to update AI Model' : 'Failed to create AI Model',
        description: errorMessage,
        variant: 'error',
        timeoutMs: 8000,
      });
    }
  };

  const models = modelsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Models Management</h1>
        <p className="text-muted-foreground">
          Manage AI models configuration, pricing, and settings (SP-Admin only)
        </p>
      </div>

      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingModel ? 'Edit AI Model' : 'Create New AI Model'}</CardTitle>
          <CardDescription>
            {editingModel
              ? `Editing model: ${editingModel.name}`
              : 'Create a new AI model configuration. Name cannot be changed after creation.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., gpt-4o-mini"
                  {...register('name')}
                  disabled={!!editingModel}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  placeholder="e.g., GPT-4o Mini"
                  {...register('displayName')}
                />
                {errors.displayName && (
                  <p className="text-sm text-destructive">
                    {errors.displayName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Select id="provider" {...register('provider')}>
                  {PROVIDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                {errors.provider && (
                  <p className="text-sm text-destructive">{errors.provider.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select id="category" {...register('category')}>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="promptPrice">Prompt Price ($/1M tokens) *</Label>
                <Input
                  id="promptPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.15"
                  {...register('promptPrice', { valueAsNumber: true })}
                />
                {errors.promptPrice && (
                  <p className="text-sm text-destructive">
                    {errors.promptPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="completionPrice">Completion Price ($/1M tokens) *</Label>
                <Input
                  id="completionPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.6"
                  {...register('completionPrice', { valueAsNumber: true })}
                />
                {errors.completionPrice && (
                  <p className="text-sm text-destructive">
                    {errors.completionPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cachePrice">Cache Price ($/1M tokens)</Label>
                <Input
                  id="cachePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.075"
                  {...register('cachePrice', { valueAsNumber: true })}
                />
                {errors.cachePrice && (
                  <p className="text-sm text-destructive">{errors.cachePrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cacheCreationPrice">Cache Creation Price ($/1M tokens)</Label>
                <Input
                  id="cacheCreationPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.075"
                  {...register('cacheCreationPrice', { valueAsNumber: true })}
                />
                {errors.cacheCreationPrice && (
                  <p className="text-sm text-destructive">
                    {errors.cacheCreationPrice.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Model description..."
                {...register('description')}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="modelRatio">Model Ratio</Label>
                <Input
                  id="modelRatio"
                  type="number"
                  step="0.1"
                  {...register('modelRatio', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outputRatio">Output Ratio</Label>
                <Input
                  id="outputRatio"
                  type="number"
                  step="0.1"
                  {...register('outputRatio', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cacheRatio">Cache Ratio</Label>
                <Input
                  id="cacheRatio"
                  type="number"
                  step="0.1"
                  {...register('cacheRatio', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cacheCreationRatio">Cache Creation Ratio</Label>
                <Input
                  id="cacheCreationRatio"
                  type="number"
                  step="0.1"
                  {...register('cacheCreationRatio', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupRatio">Group Ratio</Label>
                <Input
                  id="groupRatio"
                  type="number"
                  step="0.1"
                  {...register('groupRatio', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aliases">Aliases (comma-separated)</Label>
              <Input
                id="aliases"
                placeholder="gpt-4o-mini, 4o-mini"
                {...register('aliases')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recommended"
                {...register('recommended')}
                className="h-4 w-4"
              />
              <Label htmlFor="recommended" className="cursor-pointer">
                Recommended (show in recommended list)
              </Label>
            </div>

            <div className="flex items-center justify-end gap-3">
              {editingModel && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingModel(null);
                  reset();
                }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {isSubmitting || createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingModel
                    ? 'Update Model'
                    : 'Create Model'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle>AI Models</CardTitle>
          <CardDescription>
            {models.length} model{models.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading models...</p>
          ) : error ? (
            <p className="text-sm text-destructive">
              Failed to load models: {getErrorMessage(error)}
            </p>
          ) : models.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No models found. Create a new model above.
            </p>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <div
                  key={model.name}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {model.name}
                        </span>
                        <Badge variant="outline">{model.provider}</Badge>
                        <Badge variant="secondary">{model.category}</Badge>
                        {model.recommended && (
                          <Badge variant="default">Recommended</Badge>
                        )}
                      </div>
                      <h3 className="mb-1 text-base font-semibold">
                        {model.displayName}
                      </h3>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {model.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <span className="text-muted-foreground">Prompt: </span>
                          <span className="font-medium">
                            ${model.promptPrice}/1M
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Completion: </span>
                          <span className="font-medium">
                            ${model.completionPrice}/1M
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cache: </span>
                          <span className="font-medium">${model.cachePrice}/1M</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cache Creation: </span>
                          <span className="font-medium">
                            ${model.cacheCreationPrice}/1M
                          </span>
                        </div>
                      </div>
                      {model.aliases && model.aliases.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Aliases: </span>
                          <span className="text-xs">{model.aliases.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(model)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(model.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

