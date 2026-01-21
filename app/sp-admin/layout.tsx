'use client';

import { SpAdminShell } from '@/components/layout/sp-admin-shell';

export default function SpAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SpAdminShell>{children}</SpAdminShell>;
}

