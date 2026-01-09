'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AlertProvider } from '@/components/alert-provider';
import { LoadingProvider } from '@/components/loading-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <AlertProvider>{children}</AlertProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}


