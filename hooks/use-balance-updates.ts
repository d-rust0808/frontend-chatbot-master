'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllBalances } from '@/lib/api/payments';
import type { Balances, BalanceUpdateEvent } from '@/lib/api/types';
import type { Socket } from 'socket.io-client';

interface UseBalanceUpdatesOptions {
  tenantId: string | null;
  enabled?: boolean;
  onUpdate?: (balances: Balances) => void;
}

interface UseBalanceUpdatesReturn {
  balances: Balances;
  loading: boolean;
  connected: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  socket: Socket | null;
}

const WEBSOCKET_URL = 'wss://cchatbot.pro/socket.io';

// Export query key constant so other components can invalidate it
export const BALANCES_QUERY_KEY = ['balances'] as const;

export function useBalanceUpdates({
  tenantId: tenantIdProp,
  enabled = true,
  onUpdate,
}: UseBalanceUpdatesOptions): UseBalanceUpdatesReturn {
  const queryClient = useQueryClient();

  // Get tenantId from prop or sessionStorage
  const [tenantId, setTenantId] = useState<string | null>(tenantIdProp);

  useEffect(() => {
    if (tenantIdProp) {
      setTenantId(tenantIdProp);
    } else if (typeof window !== 'undefined') {
      // Try to get from sessionStorage
      const storedTenantId = sessionStorage.getItem('tenantId');
      if (storedTenantId) {
        setTenantId(storedTenantId);
      }
    }
  }, [tenantIdProp]);

  // Use TanStack Query for balance data
  const {
    data: balancesData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: BALANCES_QUERY_KEY,
    queryFn: async () => {
      const response = await getAllBalances();
      return response.data.balances;
    },
    enabled: enabled && !!tenantId,
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Use ref to store latest onUpdate callback to avoid recreating socket
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // Update callback when balances change (from query or WebSocket)
  useEffect(() => {
    if (balancesData && onUpdateRef.current) {
      onUpdateRef.current(balancesData);
    }
  }, [balancesData]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!enabled || !tenantId || typeof window === 'undefined') {
      return;
    }

    let currentSocket: Socket | null = null;
    let isMounted = true;

    // Dynamic import and setup socket
    const setupSocket = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const socketModule = await import('socket.io-client');
        const socketIo = socketModule.io;

        currentSocket = socketIo(WEBSOCKET_URL, {
          query: { tenantId },
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: Infinity,
          timeout: 20000,
        });

        // Only update state if component is still mounted
        if (!isMounted) {
          currentSocket.close();
          return;
        }

        // Connection events
        currentSocket.on('connect', () => {
          if (isMounted) {
            console.log('✅ WebSocket connected for balance updates');
            setConnected(true);
          }
        });

        currentSocket.on('disconnect', () => {
          if (isMounted) {
            console.log('🔴 WebSocket disconnected');
            setConnected(false);
          }
        });

        currentSocket.on('connect_error', (err) => {
          if (isMounted) {
            console.error('❌ WebSocket connection error:', err);
            setConnected(false);
          }
        });

        // Balance update event
        currentSocket.on('wallet:balance:update', (data: BalanceUpdateEvent) => {
          if (isMounted) {
            console.log('💰 Balance updated via WebSocket:', data.balances);
            // Update TanStack Query cache directly
            queryClient.setQueryData(BALANCES_QUERY_KEY, data.balances);
            if (onUpdateRef.current) {
              onUpdateRef.current(data.balances);
            }
          }
        });

        setSocket(currentSocket);
      } catch (err) {
        if (isMounted) {
          console.error('Failed to setup WebSocket:', err);
        }
      }
    };

    setupSocket();

    // Cleanup function - properly close socket and remove all listeners
    return () => {
      isMounted = false;
      if (currentSocket) {
        currentSocket.removeAllListeners();
        currentSocket.close();
        currentSocket = null;
      }
      // Also cleanup socket from state if it exists
      setSocket((prevSocket) => {
        if (prevSocket && prevSocket !== currentSocket) {
          prevSocket.removeAllListeners();
          prevSocket.close();
        }
        return null;
      });
    };
  }, [enabled, tenantId, queryClient]); // Added queryClient to dependencies

  return {
    balances: balancesData || { vnd: 0, credit: 0 }, // Return default if not loaded
    loading: isLoading,
    connected,
    error: queryError instanceof Error ? queryError : queryError ? new Error('Unknown error') : null,
    refresh,
    socket,
  };
}

