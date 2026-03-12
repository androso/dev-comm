import type { Provider } from "./provider";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  sku: string | null;
  stockQuantity: number | null;
  categoryId: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail extends Product {
  providers: Provider[];
}

export interface CreateProductPayload {
  name: string;
  price: number;
  description?: string;
  sku?: string;
  stockQuantity?: number;
  categoryId?: string;
  imageUrl?: string;
  isActive?: boolean;
  providerIds?: string[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface ProductQuery {
  page?: number;
  limit?: number;
  fields?: string;
  sort?: string;
  name?: string;
  "name[like]"?: string;
  isActive?: string;
  "price[gte]"?: number;
  "price[lte]"?: number;
}
