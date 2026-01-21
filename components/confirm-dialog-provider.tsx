'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { X } from 'lucide-react';

interface ConfirmDialogState {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmDialogContextValue {
  showConfirm: (params: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  dialog: ConfirmDialogState | null;
  closeDialog: () => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(undefined);

interface ConfirmDialogProviderProps {
  children: React.ReactNode;
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [dialog, setDialog] = useState<ConfirmDialogState | null>(null);

  const showConfirm = useCallback(
    (params: {
      title?: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      setDialog({
        title: params.title || 'Xác nhận',
        message: params.message,
        confirmText: params.confirmText || 'Xác nhận',
        cancelText: params.cancelText || 'Hủy',
        onConfirm: () => {
          params.onConfirm();
          setDialog(null);
        },
        onCancel: () => {
          if (params.onCancel) {
            params.onCancel();
          }
          setDialog(null);
        },
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  const value = useMemo(
    () => ({
      showConfirm,
      dialog,
      closeDialog,
    }),
    [showConfirm, dialog, closeDialog]
  );

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 sm:p-6">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
              <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{dialog.title}</h3>
              <button
                type="button"
                onClick={dialog.onCancel}
                className="text-gray-400 transition hover:text-gray-600 touch-manipulation"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">{dialog.message}</p>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
              <Button
                type="button"
                variant="outline"
                onClick={dialog.onCancel}
                className="w-full sm:w-auto"
                size="lg"
              >
                {dialog.cancelText}
              </Button>
              <Button
                type="button"
                onClick={dialog.onConfirm}
                className="w-full sm:w-auto"
                size="lg"
              >
                {dialog.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog(): ConfirmDialogContextValue {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return ctx;
}

