'use client';

import { ProxyAPIKeyConfig } from '@/components/ai-config/proxy-api-key-config';
import { BalanceDisplay } from '@/components/ai-config/balance-display';

export default function AIConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Configuration</h1>
        <p className="text-muted-foreground">
          Manage AI proxy settings and monitor balance
        </p>
      </div>

      {/* Proxy API Key Config */}
      <ProxyAPIKeyConfig />

      {/* Balance Display */}
      <BalanceDisplay />
    </div>
  );
}

