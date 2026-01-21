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
  Badge,
} from '@/components/ui';
import { X } from 'lucide-react';

const banIPSchema = z.object({
  reason: z.string().optional(),
  expiresAt: z.string().optional(),
  neverExpires: z.boolean().default(true),
});

type BanIPFormData = z.infer<typeof banIPSchema>;

interface BanIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBan: (reason?: string, expiresAt?: string) => Promise<void>;
  ipAddress: string;
  riskScore: number;
  suspiciousFactors: string[];
}

export function BanIPModal({
  isOpen,
  onClose,
  onBan,
  ipAddress,
  riskScore,
  suspiciousFactors,
}: BanIPModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<BanIPFormData>({
    resolver: zodResolver(banIPSchema),
    defaultValues: {
      reason: `Suspicious activity detected: ${suspiciousFactors.join(', ')}`,
      expiresAt: '',
      neverExpires: true,
    },
  });

  const neverExpires = watch('neverExpires');

  const handleFormSubmit = async (data: BanIPFormData) => {
    const reason = data.reason || undefined;
    const expiresAt =
      !data.neverExpires && data.expiresAt
        ? new Date(data.expiresAt).toISOString()
        : undefined;

    await onBan(reason, expiresAt);
    reset();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const getRiskBadgeColor = (score: number): string => {
    if (score >= 70) return '🔴';
    if (score >= 50) return '🟡';
    return '🟢';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ban IP: {ipAddress}</CardTitle>
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
          {/* Risk Info */}
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">Risk Score:</span>
              <Badge variant="destructive">
                {getRiskBadgeColor(riskScore)} {riskScore}
              </Badge>
            </div>
            <div className="text-sm">
              <div className="font-medium mb-1">Suspicious Factors:</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {suspiciousFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason</Label>
              <Textarea
                id="ban-reason"
                placeholder="Reason for banning this IP"
                {...register('reason')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ban-never-expires"
                  {...register('neverExpires')}
                  className="h-4 w-4"
                />
                <Label htmlFor="ban-never-expires" className="cursor-pointer">
                  Never expires
                </Label>
              </div>

              {!neverExpires && (
                <div className="space-y-2">
                  <Label htmlFor="ban-expires-at">Expiration Date & Time</Label>
                  <Input
                    id="ban-expires-at"
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
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? 'Banning...' : 'Ban IP'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

