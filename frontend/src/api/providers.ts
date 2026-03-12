import type { ApiSuccessResponse, ApiPaginatedResponse } from "../types/api";
import type {
  Provider,
  ProviderQuery,
  CreateProviderPayload,
  UpdateProviderPayload,
} from "../types/provider";
import { apiRequest, buildQueryString } from "./client";

export const providersApi = {
  getAll: (query: ProviderQuery = {}) =>
    apiRequest<ApiPaginatedResponse<Partial<Provider>>>(
      `/providers${buildQueryString(query)}`
    ),

  getById: (id: string) =>
    apiRequest<ApiSuccessResponse<Provider>>(`/providers/${id}`),

  create: (data: CreateProviderPayload) =>
    apiRequest<ApiSuccessResponse<Provider>>("/providers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateProviderPayload) =>
    apiRequest<ApiSuccessResponse<Provider>>(`/providers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/providers/${id}`, { method: "DELETE" }),
};
