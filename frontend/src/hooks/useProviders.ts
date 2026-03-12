import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providersApi } from "../api/providers";
import type {
  ProviderQuery,
  CreateProviderPayload,
  UpdateProviderPayload,
} from "../types/provider";

export const providerKeys = {
  all: ["providers"] as const,
  lists: () => [...providerKeys.all, "list"] as const,
  list: (query: ProviderQuery) => [...providerKeys.lists(), query] as const,
  details: () => [...providerKeys.all, "detail"] as const,
  detail: (id: string) => [...providerKeys.details(), id] as const,
};

export function useProviders(query: ProviderQuery = {}) {
  return useQuery({
    queryKey: providerKeys.list(query),
    queryFn: () => providersApi.getAll(query),
  });
}

export function useProvider(id: string) {
  return useQuery({
    queryKey: providerKeys.detail(id),
    queryFn: () => providersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProviderPayload) => providersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
    },
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProviderPayload }) =>
      providersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(id) });
    },
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
    },
  });
}
