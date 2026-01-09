'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface LoadingContextValue {
  isLoading: boolean;
  setLoading: (value: boolean) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((value: boolean) => {
    setIsLoading(value);
  }, []);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      setIsLoading(true);
      try {
        const result = await promise;
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      isLoading,
      setLoading,
      withLoading,
    }),
    [isLoading, setLoading, withLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/20">
          <div className="flex flex-col items-center gap-3 rounded-md bg-white px-6 py-4 shadow-lg">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
            <p className="text-xs font-medium text-gray-700">
              Đang xử lý, vui lòng chờ...
            </p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return ctx;
}


