'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AlertVariant = 'success' | 'error' | 'info' | 'warning';

interface AlertState {
  message: string;
  description?: string;
  variant: AlertVariant;
}

interface AlertContextValue {
  alert: AlertState | null;
  showAlert: (params: {
    message: string;
    description?: string;
    variant?: AlertVariant;
    timeoutMs?: number;
  }) => void;
  clearAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

interface AlertProviderProps {
  children: React.ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const showAlert = useCallback(
    (params: {
      message: string;
      description?: string;
      variant?: AlertVariant;
      timeoutMs?: number;
    }) => {
      const { message, description, variant = 'info', timeoutMs = 5000 } = params;
      setAlert({ message, description, variant });

      if (timeoutMs > 0) {
        window.setTimeout(() => {
          setAlert((current) =>
            current && current.message === message ? null : current
          );
        }, timeoutMs);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      alert,
      showAlert,
      clearAlert,
    }),
    [alert, showAlert, clearAlert]
  );

  const variantClasses: Record<AlertVariant, string> = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {alert && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
          <div
            className={`pointer-events-auto w-full max-w-lg rounded-md border px-4 py-3 shadow-sm ${variantClasses[alert.variant]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{alert.message}</p>
                {alert.description && (
                  <p className="mt-1 text-xs opacity-90">{alert.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={clearAlert}
                className="text-xs font-medium opacity-70 transition hover:opacity-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return ctx;
}


