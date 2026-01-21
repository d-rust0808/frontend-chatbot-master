'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSystemConfigs,
  getSystemConfig,
  createSystemConfig,
  updateSystemConfig,
  deleteSystemConfig,
  initializeSystemConfigs,
  getAIModels,
  getAIModel,
  createAIModel,
  updateAIModel,
  deleteAIModel,
  getAILogs,
  getSuspiciousIPs,
  getProxyBalance,
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  toggleBlacklistStatus,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist,
  toggleWhitelistStatus,
  banIP,
  unbanIP,
  getAccessLogs,
  getAccessLogSuspiciousIPs,
  getIPDetails,
  banIPFromSuspicious,
} from '@/lib/api/admin';
import type {
  SystemConfigCategory,
  GetSystemConfigsParams,
  CreateSystemConfigRequest,
  UpdateSystemConfigRequest,
  CreateAIModelRequest,
  UpdateAIModelRequest,
  GetAILogsParams,
  GetAILogsSuspiciousIPsParams,
  GetIPEntriesParams,
  CreateIPEntryRequest,
  ToggleIPEntryRequest,
  GetAccessLogsParams,
  GetSuspiciousIPsParams as GetAccessLogSuspiciousIPsParams,
  GetIPDetailsParams,
  BanIPFromSuspiciousRequest,
} from '@/lib/api/types';

export const SYSTEM_CONFIGS_QUERY_KEY = ['system-configs'] as const;
export const SYSTEM_CONFIG_QUERY_KEY = (category: string, key: string) =>
  ['system-config', category, key] as const;

export function useSystemConfigs(params?: GetSystemConfigsParams) {
  return useQuery({
    queryKey: [...SYSTEM_CONFIGS_QUERY_KEY, params],
    queryFn: () => getSystemConfigs(params),
  });
}

export function useSystemConfig(category: string, key: string) {
  return useQuery({
    queryKey: SYSTEM_CONFIG_QUERY_KEY(category, key),
    queryFn: () => getSystemConfig(category, key),
    enabled: !!category && !!key,
  });
}

export function useCreateSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSystemConfigRequest) => createSystemConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_CONFIGS_QUERY_KEY });
    },
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      category,
      key,
      data,
    }: {
      category: string;
      key: string;
      data: UpdateSystemConfigRequest;
    }) => updateSystemConfig(category, key, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_CONFIGS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: SYSTEM_CONFIG_QUERY_KEY(variables.category, variables.key),
      });
    },
  });
}

export function useDeleteSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ category, key }: { category: string; key: string }) =>
      deleteSystemConfig(category, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_CONFIGS_QUERY_KEY });
    },
  });
}

export function useInitializeSystemConfigs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => initializeSystemConfigs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_CONFIGS_QUERY_KEY });
    },
  });
}

// AI Models Hooks
export const AI_MODELS_QUERY_KEY = ['ai-models'] as const;
export const AI_MODEL_QUERY_KEY = (name: string) => ['ai-model', name] as const;

export function useAIModels() {
  return useQuery({
    queryKey: AI_MODELS_QUERY_KEY,
    queryFn: () => getAIModels(),
  });
}

export function useAIModel(name: string) {
  return useQuery({
    queryKey: AI_MODEL_QUERY_KEY(name),
    queryFn: () => getAIModel(name),
    enabled: !!name,
  });
}

export function useCreateAIModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAIModelRequest) => createAIModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_MODELS_QUERY_KEY });
    },
  });
}

export function useUpdateAIModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: UpdateAIModelRequest }) =>
      updateAIModel(name, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AI_MODELS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: AI_MODEL_QUERY_KEY(variables.name),
      });
    },
  });
}

export function useDeleteAIModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => deleteAIModel(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_MODELS_QUERY_KEY });
    },
  });
}

// AI Logs Hooks
export const AI_LOGS_QUERY_KEY = ['ai-logs'] as const;
export const SUSPICIOUS_IPS_QUERY_KEY = ['suspicious-ips'] as const;

export function useAILogs(params?: GetAILogsParams) {
  return useQuery({
    queryKey: [...AI_LOGS_QUERY_KEY, params],
    queryFn: () => getAILogs(params),
  });
}

export function useSuspiciousIPs(params?: GetAILogsSuspiciousIPsParams) {
  return useQuery({
    queryKey: [...SUSPICIOUS_IPS_QUERY_KEY, params],
    queryFn: () => getSuspiciousIPs(params),
  });
}

// Proxy Balance Hooks
export const PROXY_BALANCE_QUERY_KEY = ['proxy-balance'] as const;

export function useProxyBalance() {
  return useQuery({
    queryKey: PROXY_BALANCE_QUERY_KEY,
    queryFn: () => getProxyBalance(),
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });
}

// IP Management Hooks
export const BLACKLIST_QUERY_KEY = ['ip-blacklist'] as const;
export const WHITELIST_QUERY_KEY = ['ip-whitelist'] as const;

export function useBlacklist(params?: GetIPEntriesParams) {
  return useQuery({
    queryKey: [...BLACKLIST_QUERY_KEY, params],
    queryFn: () => getBlacklist(params),
  });
}

export function useWhitelist(params?: GetIPEntriesParams) {
  return useQuery({
    queryKey: [...WHITELIST_QUERY_KEY, params],
    queryFn: () => getWhitelist(params),
  });
}

export function useAddToBlacklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIPEntryRequest) => addToBlacklist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLACKLIST_QUERY_KEY });
    },
  });
}

export function useRemoveFromBlacklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ipAddress: string) => removeFromBlacklist(ipAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLACKLIST_QUERY_KEY });
    },
  });
}

export function useToggleBlacklistStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ipAddress,
      data,
    }: {
      ipAddress: string;
      data: ToggleIPEntryRequest;
    }) => toggleBlacklistStatus(ipAddress, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLACKLIST_QUERY_KEY });
    },
  });
}

export function useAddToWhitelist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIPEntryRequest) => addToWhitelist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WHITELIST_QUERY_KEY });
    },
  });
}

export function useRemoveFromWhitelist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ipAddress: string) => removeFromWhitelist(ipAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WHITELIST_QUERY_KEY });
    },
  });
}

export function useToggleWhitelistStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ipAddress,
      data,
    }: {
      ipAddress: string;
      data: ToggleIPEntryRequest;
    }) => toggleWhitelistStatus(ipAddress, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WHITELIST_QUERY_KEY });
    },
  });
}

export function useBanIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIPEntryRequest) => banIP(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLACKLIST_QUERY_KEY });
    },
  });
}

export function useUnbanIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ipAddress: string) => unbanIP(ipAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLACKLIST_QUERY_KEY });
    },
  });
}

// IP Access Logs Hooks
export const ACCESS_LOGS_QUERY_KEY = ['access-logs'] as const;
export const ACCESS_LOG_SUSPICIOUS_IPS_QUERY_KEY = ['access-log-suspicious-ips'] as const;
export const IP_DETAILS_QUERY_KEY = (ipAddress: string) =>
  ['ip-details', ipAddress] as const;

export function useAccessLogs(params?: GetAccessLogsParams) {
  return useQuery({
    queryKey: [...ACCESS_LOGS_QUERY_KEY, params],
    queryFn: () => getAccessLogs(params),
  });
}

export function useAccessLogSuspiciousIPs(params?: GetAccessLogSuspiciousIPsParams) {
  return useQuery({
    queryKey: [...ACCESS_LOG_SUSPICIOUS_IPS_QUERY_KEY, params],
    queryFn: () => getAccessLogSuspiciousIPs(params),
    refetchInterval: 300000, // Auto refresh every 5 minutes
  });
}

export function useIPDetails(ipAddress: string, params?: GetIPDetailsParams) {
  return useQuery({
    queryKey: [...IP_DETAILS_QUERY_KEY(ipAddress), params],
    queryFn: () => getIPDetails(ipAddress, params),
    enabled: !!ipAddress,
  });
}

export function useBanIPFromSuspicious() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ipAddress,
      data,
    }: {
      ipAddress: string;
      data: BanIPFromSuspiciousRequest;
    }) => banIPFromSuspicious(ipAddress, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCESS_LOG_SUSPICIOUS_IPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BLACKLIST_QUERY_KEY });
    },
  });
}

