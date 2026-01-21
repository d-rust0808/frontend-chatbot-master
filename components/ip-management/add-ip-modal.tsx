'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import { X } from 'lucide-react';
import type { CreateIPEntryRequest } from '@/lib/api/types';

const addIPSchema = z.object({
  ipAddress: z
    .string()
    .min(1, 'IP Address is required')
    .regex(
      /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
      'Invalid IP address or CIDR format (e.g., 192.168.1.100 or 192.168.1.0/24)'
    ),
  reason: z.string().optional(),
  expiresAt: z.string().optional(),
  neverExpires: z.boolean().default(false),
});

type AddIPFormData = z.infer<typeof addIPSchema>;

interface AddIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIPEntryRequest) => Promise<void>;
  title: string;
  submitLabel: string;
  defaultIP?: string;
}

export function AddIPModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  defaultIP,
}: AddIPModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddIPFormData>({
    resolver: zodResolver(addIPSchema),
    defaultValues: {
      ipAddress: defaultIP || '',
      reason: '',
      expiresAt: '',
      neverExpires: true,
    },
  });

  const neverExpires = watch('neverExpires');

  const handleFormSubmit = async (data: AddIPFormData) => {
    const submitData: CreateIPEntryRequest = {
      ipAddress: data.ipAddress,
      reason: data.reason || undefined,
      expiresAt:
        !data.neverExpires && data.expiresAt
          ? new Date(data.expiresAt).toISOString()
          : undefined,
    };

    await onSubmit(submitData);
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip-address">
                IP Address / CIDR *
                <span className="ml-2 text-xs text-muted-foreground">
                  (e.g., 192.168.1.100 or 192.168.1.0/24)
                </span>
              </Label>
              <Input
                id="ip-address"
                placeholder="192.168.1.100"
                {...register('ipAddress')}
                className="font-mono"
              />
              {errors.ipAddress && (
                <p className="text-sm text-destructive">{errors.ipAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Suspicious activity detected"
                {...register('reason')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="never-expires"
                  {...register('neverExpires')}
                  className="h-4 w-4"
                />
                <Label htmlFor="never-expires" className="cursor-pointer">
                  Never expires
                </Label>
              </div>

              {!neverExpires && (
                <div className="space-y-2">
                  <Label htmlFor="expires-at">Expiration Date & Time</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    {...register('expiresAt')}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

