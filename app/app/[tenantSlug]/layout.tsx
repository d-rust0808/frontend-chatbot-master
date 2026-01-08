import { redirect } from 'next/navigation';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenantSlug } = await params;

  // Basic validation
  if (!tenantSlug || typeof tenantSlug !== 'string') {
    redirect('/login');
  }

  // Check if user is authenticated
  // In a real app, you'd check the token here
  // For now, we'll let the API client handle it

  return <>{children}</>;
}

