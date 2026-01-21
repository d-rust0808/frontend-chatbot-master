'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  LogOut,
  X,
  CreditCard,
  UserCircle2,
  Database,
  Tag,
  Package,
  MessageSquare,
  MessageCircle,
  Video,
  ShoppingBag,
  Instagram,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Logo } from '@/components/logo';
import { WalletDisplay } from '@/components/wallet-display';
import { LanguageSwitcher } from '@/components/language-switcher';
import { getAllBalances } from '@/lib/api/payments';
import { BALANCES_QUERY_KEY } from '@/hooks/use-balance-updates';
import type { Wallet, ServicePlatform, ServicePackageSubscriptionSummary } from '@/lib/api/types';
import type { SystemRole } from '@/lib/api/types';

interface AdminShellProps {
  children: React.ReactNode;
}

// Map service platforms to icons
const getServiceIcon = (service: ServicePlatform): LucideIcon => {
  const iconMap: Record<ServicePlatform, LucideIcon> = {
    whatsapp: MessageSquare,
    messenger: MessageCircle,
    tiktok: Video,
    zalo: MessageCircle,
    instagram: Instagram,
    shopee: ShoppingBag,
  };
  return iconMap[service] || MessageSquare;
};

// Map service name to config route
const getServiceConfigUrl = (service: ServicePlatform): string => {
  // Admin routes for platform configuration
  return `/admin/platforms?service=${service}`;
};

const getNavigation = (userRole: SystemRole | null) => {
  // Admin navigation: Quản lý tenants, users, và các resources của tenants
  // Admin có Service Packages để đăng ký dịch vụ (khác với SP-Admin quản lý packages)
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Tenants', href: '/admin/tenants', icon: Building2 },
    { name: 'Service Packages', href: '/admin/service-packages', icon: Package },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Database', href: '/admin/db-config', icon: Database },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return adminNavigation;
};

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<SystemRole | null>(null);

  // Get balances from API (same query key as payments page for sync)
  const { data: balancesData } = useQuery({
    queryKey: BALANCES_QUERY_KEY,
    queryFn: async () => {
      const response = await getAllBalances();
      return response.data.balances;
    },
    retry: false,
    enabled: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Convert balances to wallet format for WalletDisplay component
  const wallet: Wallet | null = balancesData
    ? {
        vndBalance: balancesData.vnd,
        creditBalance: balancesData.credit,
      }
    : null;

  useEffect(() => {
    // Bảo vệ route: Check role TRƯỚC TIÊN để tránh render sai layout
    // Đọc role từ sessionStorage - nếu chưa có, đợi một chút rồi check lại (tránh race condition)
    let role = sessionStorage.getItem('userRole') as SystemRole | null;
    
    // Nếu chưa có role, đợi 100ms rồi check lại (tránh race condition khi login)
    if (!role) {
      const checkRole = setTimeout(() => {
        role = sessionStorage.getItem('userRole') as SystemRole | null;
        handleRoleCheck(role);
      }, 100);
      return () => clearTimeout(checkRole);
    }
    
    handleRoleCheck(role);
    
    function handleRoleCheck(currentRole: SystemRole | null) {
      // Bảo vệ route: Chỉ cho phép admin role vào admin routes
      // Nếu role là sp-admin, redirect về sp-admin dashboard (không được ở admin routes)
      // Nếu không có role hoặc role không phải admin, redirect về login
      if (currentRole === 'sp-admin') {
        // Role sp-admin không được vào admin routes - redirect ngay, không render gì
        window.location.href = '/sp-admin/dashboard';
        return;
      }
      
      if (!currentRole || currentRole !== 'admin') {
        // Không có role hoặc role không phải admin - redirect về login, không render gì
        window.location.href = '/login';
        return;
      }
      
      // Role là admin - tiếp tục load data và render
      setUserRole(currentRole);
      // Wallet data sẽ được load từ API query (không dùng sessionStorage nữa)
    }
  }, [router]);

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
            userRole={userRole}
          />
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent pathname={pathname} onLogout={handleLogout} userRole={userRole} />
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
  userRole?: SystemRole | null;
}

function SidebarContent({
  pathname,
  onLogout,
  onClose,
  userRole,
}: SidebarContentProps) {
  const navigation = getNavigation(userRole ?? null);
  const [subscriptions, setSubscriptions] = useState<ServicePackageSubscriptionSummary[]>([]);

  useEffect(() => {
    // Load subscriptions from sessionStorage
    const storedSubscriptions = sessionStorage.getItem('subscriptions');
    if (storedSubscriptions) {
      try {
        const parsed = JSON.parse(storedSubscriptions);
        setSubscriptions(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSubscriptions([]);
      }
    }
  }, []);

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

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
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

        {/* Service Subscriptions Section */}
        {subscriptions.length > 0 && (
          <>
            <div className="my-4 px-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Dịch vụ đã đăng ký
              </h3>
            </div>
            <div className="space-y-1">
              {subscriptions.map((sub) => {
                const ServiceIcon = getServiceIcon(sub.service);
                const configUrl = getServiceConfigUrl(sub.service);
                const isActive = pathname === configUrl || pathname?.startsWith(configUrl + '/');
                const isExpiringSoon = sub.daysRemaining <= 7 && sub.daysRemaining > 0;

                return (
                  <Link
                    key={sub.id}
                    href={configUrl}
                    onClick={onClose}
                    className={cn(
                      'group flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] rounded-md',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {sub.imageUrl ? (
                      <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded">
                        <Image
                          src={sub.imageUrl}
                          alt={sub.serviceName}
                          fill
                          className="object-contain"
                          sizes="24px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-primary/10 to-primary/5">
                        <ServiceIcon className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium">
                          {sub.serviceName}
                        </span>
                        {isExpiringSoon && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            {sub.daysRemaining}d
                          </span>
                        )}
                      </div>
                      {!isExpiringSoon && sub.daysRemaining > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {sub.daysRemaining} ngày
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
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

