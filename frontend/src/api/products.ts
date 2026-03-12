import type { ApiSuccessResponse, ApiPaginatedResponse } from "../types/api";
import type {
  Product,
  ProductDetail,
  ProductQuery,
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product";
import { apiRequest, buildQueryString } from "./client";

export const productsApi = {
  getAll: (query: ProductQuery = {}) =>
    apiRequest<ApiPaginatedResponse<Partial<Product>>>(
      `/products${buildQueryString(query)}`
    ),

  getById: (id: string) =>
    apiRequest<ApiSuccessResponse<ProductDetail>>(`/products/${id}`),

  create: (data: CreateProductPayload) =>
    apiRequest<ApiSuccessResponse<Product>>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateProductPayload) =>
    apiRequest<ApiSuccessResponse<Product>>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/products/${id}`, { method: "DELETE" }),
};
