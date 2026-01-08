'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer } from '@/lib/api/admin';
import { useTenantsStore } from '@/lib/stores/tenants-store';
import type { Tenant } from '@/lib/api/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { useState } from 'react';

const customerSchema = z.object({
  tenant: z.object({
    name: z.string().min(1, 'Tenant name is required'),
    slug: z
      .string()
      .min(1, 'Tenant slug is required')
      .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  }),
  adminUser: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().optional(),
  }),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CreateCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addTenant = useTenantsStore((state) => state.addTenant);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (response) => {
      const newTenant: Tenant = {
        id: response.data.tenant.id,
        name: response.data.tenant.name,
        slug: response.data.tenant.slug,
        metadata: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addTenant(newTenant);
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      router.push('/admin/tenants');
    },
    onError: (err: unknown) => {
      const errorData = (err as { response?: { data?: { error?: { message?: string; details?: Array<{ path: string[]; message: string }> } } } }).response?.data;
      
      if (errorData?.error) {
        const apiError = errorData.error;
        
        // Handle validation errors with details
        if (apiError.details && Array.isArray(apiError.details)) {
          const details: Record<string, string> = {};
          apiError.details.forEach((detail) => {
            const fieldPath = detail.path.join('.');
            details[fieldPath] = detail.message;
          });
          setFieldErrors(details);
          setError(apiError.message || 'Validation error');
        } else {
          setError(apiError.message || 'Failed to create customer');
          setFieldErrors({});
        }
      } else {
        setError((err as Error).message || 'Failed to create customer');
        setFieldErrors({});
      }
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    setError(null);
    setFieldErrors({});
    mutation.mutate(data);
  };

  const getFieldError = (path: string): string | undefined => {
    return fieldErrors[path] || undefined;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Customer</h1>
        <p className="text-muted-foreground">
          Create a new tenant and admin user in one step
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-sm text-destructive">{error}</div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
            <CardDescription>
              Basic information about the tenant organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenant.name">Tenant Name *</Label>
              <Input
                id="tenant.name"
                {...register('tenant.name')}
                placeholder="Shop A"
              />
              {(errors.tenant?.name || getFieldError('tenant.name')) && (
                <p className="text-sm text-destructive">
                  {errors.tenant?.name?.message || getFieldError('tenant.name')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant.slug">Tenant Slug *</Label>
              <Input
                id="tenant.slug"
                {...register('tenant.slug')}
                placeholder="shop-a"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier (lowercase letters, numbers, hyphens only)
              </p>
              {(errors.tenant?.slug || getFieldError('tenant.slug')) && (
                <p className="text-sm text-destructive">
                  {errors.tenant?.slug?.message || getFieldError('tenant.slug')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin User Information</CardTitle>
            <CardDescription>
              Create the initial admin user for this tenant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminUser.email">Email *</Label>
              <Input
                id="adminUser.email"
                type="email"
                {...register('adminUser.email')}
                placeholder="owner@shop-a.com"
              />
              {(errors.adminUser?.email || getFieldError('adminUser.email')) && (
                <p className="text-sm text-destructive">
                  {errors.adminUser?.email?.message || getFieldError('adminUser.email')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminUser.password">Password *</Label>
              <Input
                id="adminUser.password"
                type="password"
                {...register('adminUser.password')}
                placeholder="Minimum 8 characters"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
              {(errors.adminUser?.password || getFieldError('adminUser.password')) && (
                <p className="text-sm text-destructive">
                  {errors.adminUser?.password?.message || getFieldError('adminUser.password')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminUser.name">Name (Optional)</Label>
              <Input
                id="adminUser.name"
                {...register('adminUser.name')}
                placeholder="Owner Shop A"
              />
              {(errors.adminUser?.name || getFieldError('adminUser.name')) && (
                <p className="text-sm text-destructive">
                  {errors.adminUser?.name?.message || getFieldError('adminUser.name')}
                </p>
              )}
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
            {mutation.isPending ? 'Creating...' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

