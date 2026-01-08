'use client';

import { Wallet, Sparkles } from 'lucide-react';
import type { Wallet as WalletType } from '@/lib/api/types';

interface WalletDisplayProps {
  wallet: WalletType;
  showIcon?: boolean;
  className?: string;
}

export function WalletDisplay({
  wallet,
  showIcon = true,
  className = '',
}: WalletDisplayProps) {
  const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCredit = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      <div className="flex items-center gap-1.5">
        {showIcon && (
          <Wallet className="h-5 w-5 text-primary" />
        )}
        <span className="text-xs sm:text-sm font-semibold text-gray-900">
          {formatVND(wallet.vndBalance)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {showIcon && (
          <Sparkles className="h-5 w-5 text-primary" />
        )}
        <span className="text-xs sm:text-sm font-semibold text-gray-900">
          {formatCredit(wallet.creditBalance)}
        </span>
      </div>
    </div>
  );
}

