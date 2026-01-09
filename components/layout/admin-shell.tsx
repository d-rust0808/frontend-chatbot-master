'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  X,
  ScrollText,
  SlidersHorizontal,
  CreditCard,
  UserCircle2,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Logo } from '@/components/logo';
import { WalletDisplay } from '@/components/wallet-display';
import { LanguageSwitcher } from '@/components/language-switcher';
import type { Wallet } from '@/lib/api/types';
import type { SystemRole } from '@/lib/api/types';

interface AdminShellProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Tenants', href: '/admin/tenants', icon: Building2 },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Logs', href: '/admin/logs', icon: ScrollText },
  { name: 'Config', href: '/admin/config', icon: SlidersHorizontal },
  { name: 'Service Packages', href: '/admin/service-packages', icon: Package },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [userRole, setUserRole] = useState<SystemRole | null>(null);

  useEffect(() => {
    const walletData = sessionStorage.getItem('wallet');
    if (walletData) {
      try {
        const parsedWallet = JSON.parse(walletData);
        if (parsedWallet && typeof parsedWallet.vndBalance === 'number' && typeof parsedWallet.creditBalance === 'number') {
          setWallet(parsedWallet);
        }
      } catch {
        // Invalid wallet data, ignore
      }
    }
    const role = sessionStorage.getItem('userRole') as SystemRole | null;
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Mobile */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <SidebarContent
            pathname={pathname}
            onLogout={handleLogout}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent pathname={pathname} onLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          showMenuButton
          onMenuClick={() => setSidebarOpen(true)}
          logoHref="/admin/dashboard"
          showLanguageSwitcher={false}
          rightContent={
            <div className="flex items-center gap-4">
              {wallet && userRole !== 'sp-admin' && (
                <WalletDisplay wallet={wallet} />
              )}
              <LanguageSwitcher />
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                <span>Admin Panel</span>
              </div>
            </div>
          }
          containerClassName="w-full"
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  pathname: string;
  onLogout: () => void;
  onClose?: () => void;
}

function SidebarContent({
  pathname,
  onLogout,
  onClose,
}: SidebarContentProps) {
  return (
    <>
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        <Logo href="/admin/dashboard" size="md" />
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );
}

