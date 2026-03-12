import type { ApiSuccessResponse, ApiPaginatedResponse } from "../types/api";
import type {
  Category,
  CategoryQuery,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category";
import { apiRequest, buildQueryString } from "./client";

export const categoriesApi = {
  getAll: (query: CategoryQuery = {}) =>
    apiRequest<ApiPaginatedResponse<Partial<Category>>>(
      `/categories${buildQueryString(query)}`
    ),

  getById: (id: string) =>
    apiRequest<ApiSuccessResponse<Category>>(`/categories/${id}`),

  create: (data: CreateCategoryPayload) =>
    apiRequest<ApiSuccessResponse<Category>>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCategoryPayload) =>
    apiRequest<ApiSuccessResponse<Category>>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/categories/${id}`, { method: "DELETE" }),
};
