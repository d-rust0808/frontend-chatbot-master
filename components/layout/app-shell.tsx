'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Bot,
  Plug,
  BarChart3,
  History,
  Database,
  Package,
  Tag,
  Users,
  ShoppingBag,
  Wallet,
  Coins,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { Logo } from '@/components/logo';
import { WalletDisplay } from '@/components/wallet-display';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useBalanceUpdates } from '@/hooks/use-balance-updates';
import type { Wallet as WalletType } from '@/lib/api/types';

interface AppShellProps { children: React.ReactNode; tenantSlug: string }

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chatbots', href: '/chatbots', icon: Bot },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Messages', href: '/messages', icon: History },
  { name: 'Platforms', href: '/platforms', icon: Plug },
  { name: 'DB Config', href: '/db-config', icon: Database },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Plans', href: '/plans', icon: Wallet },
  { name: 'Balance', href: '/balance', icon: Coins },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppShell({ children, tenantSlug }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletType | null>(null);

  // Get tenantId - try to get from API response or use tenantSlug as fallback
  // Note: tenantId should be stored in sessionStorage after login/tenant selection
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    // Try to get tenantId from sessionStorage
    // If not available, we'll need to get it from API or use tenantSlug
    const storedTenantId = sessionStorage.getItem('tenantId');
    if (storedTenantId) {
      setTenantId(storedTenantId);
    }
    // TODO: If tenantId not in sessionStorage, fetch from API using tenantSlug

    // Load initial wallet from sessionStorage
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
  }, []);

  // Memoize onUpdate callback to prevent recreating socket connection
  const handleBalanceUpdate = useCallback((newBalances: { vnd: number; credit: number }) => {
    // Update wallet state immediately when WebSocket updates
    const updatedWallet: WalletType = {
      vndBalance: newBalances.vnd,
      creditBalance: newBalances.credit,
    };
    setWallet(updatedWallet);
    // Update sessionStorage
    sessionStorage.setItem('wallet', JSON.stringify(updatedWallet));
  }, []);

  // Use WebSocket for real-time balance updates
  const { balances } = useBalanceUpdates({
    tenantId,
    enabled: !!tenantId,
    onUpdate: handleBalanceUpdate,
  });

  // Update wallet when balances change (from API or WebSocket)
  // Only update if balances have been loaded from API (not initial default)
  useEffect(() => {
    // Only update wallet if we have tenantId (meaning balances are from API/WebSocket)
    // This prevents overwriting wallet from sessionStorage with default {vnd: 0, credit: 0}
    if (tenantId && (balances.vnd > 0 || balances.credit > 0 || wallet === null)) {
      const updatedWallet: WalletType = {
        vndBalance: balances.vnd,
        creditBalance: balances.credit,
      };
      setWallet(updatedWallet);
      sessionStorage.setItem('wallet', JSON.stringify(updatedWallet));
    }
  }, [balances, tenantId, wallet]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/login');
  };

  const basePath = `/app/${tenantSlug}`;

  return (
    <div className="flex h-screen bg-gray-50">
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
            basePath={basePath}
            pathname={pathname}
            onLogout={handleLogout}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent
            basePath={basePath}
            pathname={pathname}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          showMenuButton
          onMenuClick={() => setSidebarOpen(true)}
          logoHref={`${basePath}/dashboard`}
          showLanguageSwitcher={false}
          rightContent={
            <div className="flex items-center gap-4">
              {wallet ? (
                <WalletDisplay wallet={wallet} />
              ) : balances.vnd > 0 || balances.credit > 0 ? (
                <WalletDisplay
                  wallet={{
                    vndBalance: balances.vnd,
                    creditBalance: balances.credit,
                  }}
                />
              ) : null}
              <LanguageSwitcher />
              <span className="text-sm font-medium text-gray-700">
                {tenantSlug}
              </span>
            </div>
          }
          containerClassName="w-full"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps { basePath: string; pathname: string; onLogout: () => void; onClose?: () => void }

function SidebarContent({
  basePath,
  pathname,
  onLogout,
  onClose,
}: SidebarContentProps) {
  return (
    <>
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        <Logo href={`${basePath}/dashboard`} size="md" />
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.name}
              href={href}
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

