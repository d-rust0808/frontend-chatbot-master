import { create } from 'zustand';
import type { Tenant } from '@/lib/api/types';

interface TenantsState {
  tenants: Tenant[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  setTenants: (tenants: Tenant[]) => void;
  addTenant: (tenant: Tenant) => void;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => void;
  removeTenant: (tenantId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null) => void;
  reset: () => void;
}

const initialState = {
  tenants: [],
  isLoading: false,
  error: null,
  pagination: null,
};

export const useTenantsStore = create<TenantsState>((set) => ({
  ...initialState,
  setTenants: (tenants) => set({ tenants }),
  addTenant: (tenant) =>
    set((state) => ({
      tenants: [tenant, ...state.tenants],
    })),
  updateTenant: (tenantId, updates) =>
    set((state) => ({
      tenants: state.tenants.map((t) =>
        t.id === tenantId ? { ...t, ...updates } : t
      ),
    })),
  removeTenant: (tenantId) =>
    set((state) => ({
      tenants: state.tenants.filter((t) => t.id !== tenantId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),
  reset: () => set(initialState),
}));

