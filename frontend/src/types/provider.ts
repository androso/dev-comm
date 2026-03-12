export interface Provider {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  description: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderPayload {
  name: string;
  address?: string;
  phone?: string;
  description?: string;
  email?: string;
  isActive?: boolean;
}

export type UpdateProviderPayload = Partial<CreateProviderPayload>;

export interface ProviderQuery {
  page?: number;
  limit?: number;
  fields?: string;
  sort?: string;
  name?: string;
  "name[like]"?: string;
  isActive?: string;
}
