'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui';
import { Logo } from './logo';
import { LanguageSwitcher } from './language-switcher';

interface HeaderProps {
  showLanguageSwitcher?: boolean;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  logoHref?: string;
  rightContent?: React.ReactNode;
  containerClassName?: string;
}

export function Header({
  showLanguageSwitcher = true,
  showMenuButton = false,
  onMenuClick,
  logoHref = '/',
  rightContent,
  containerClassName = 'container mx-auto',
}: HeaderProps) {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className={containerClassName}>
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {showMenuButton && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMenuClick}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <Logo
              href={logoHref}
              size="md"
              className={showMenuButton ? 'hidden sm:flex' : ''}
            />
          </div>

          <div className="flex items-center gap-4">
            {rightContent}
            {showLanguageSwitcher && <LanguageSwitcher />}
          </div>
        </div>
      </div>
    </header>
  );
}

