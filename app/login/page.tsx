'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/lib/api/auth';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translations';
import { Header } from '@/components/header';
import type { SystemRole, TenantMembership } from '@/lib/api/types';

export default function LoginPage() {
  const { t } = useTranslation();
  
  const loginSchema = z.object({
    email: z.string().email(t.auth.invalidEmail),
    password: z.string().min(1, t.auth.passwordRequired),
  });

type LoginFormData = z.infer<typeof loginSchema>;

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      const { accessToken, refreshToken, user, tenants, wallet } = response.data;
      
      // Store tokens
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      if (user?.role) {
        sessionStorage.setItem('userRole', user.role);
      }
      if (wallet) {
        sessionStorage.setItem('wallet', JSON.stringify(wallet));
      }

      // Route based on role: sp-admin goes to admin; others go tenant flow using tenants from backend
      const role: SystemRole | null = (user?.role as SystemRole) || null;
      if (role === 'sp-admin') {
        router.push('/admin/dashboard');
      } else {
        const tenantList: TenantMembership[] = tenants || [];
        if (tenantList.length === 1) {
          const tenant = tenantList[0];
          sessionStorage.setItem('tenantSlug', tenant.slug);
          sessionStorage.setItem('tenantId', tenant.id);
          sessionStorage.setItem('lastTenantSlug', tenant.slug);
          router.push(`/app/${tenant.slug}/dashboard`);
        } else if (tenantList.length > 1) {
          // TODO: support tenant selection UI when multi-tenant is needed
          const tenant = tenantList[0];
          sessionStorage.setItem('tenantSlug', tenant.slug);
          sessionStorage.setItem('tenantId', tenant.id);
          sessionStorage.setItem('lastTenantSlug', tenant.slug);
          router.push(`/app/${tenant.slug}/dashboard`);
        } else {
          setError('No tenant assigned to this account. Please contact administrator.');
        }
      }
    },
    onError: (err: Error) => {
      setError(err.message || t.auth.loginFailed);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t.auth.login}</CardTitle>
          <CardDescription>
            {t.auth.emailPlaceholder}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t.auth.email}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t.auth.emailPlaceholder}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t.auth.password}
              </label>
              <Input
                id="password"
                type="password"
                placeholder={t.auth.passwordPlaceholder}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 p-3 text-sm text-destructive transition-all duration-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? t.common.loading : t.auth.login}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

