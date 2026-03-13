import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
} from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useProviders } from "../../hooks/useProviders";
import { FormField } from "../../components/ui/FormField";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ApiError } from "../../api/client";
import type { CreateProductPayload } from "../../types/product";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

interface ProductFormValues {
  name: string;
  price: number;
  description?: string;
  sku?: string;
  stockQuantity?: number;
  categoryId?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data, isLoading } = useProduct(id!);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const { data: categoriesData } = useCategories({ limit: 100, fields: "id,name" });
  const { data: providersData } = useProviders({ limit: 100, fields: "id,name" });

  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>();

  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      reset({
        name: p.name,
        price: p.price,
        description: p.description ?? undefined,
        sku: p.sku ?? undefined,
        stockQuantity: p.stockQuantity ?? undefined,
        categoryId: p.categoryId ?? undefined,
        imageUrl: p.imageUrl ?? undefined,
        isActive: p.isActive,
      });
      setSelectedProviderIds(p.providers?.map((prov) => prov.id) ?? []);
    }
  }, [data, reset]);

  if (isEdit && isLoading) return <LoadingSpinner />;

  const toggleProvider = (providerId: string) => {
    setSelectedProviderIds((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  };

  const onSubmit = async (formData: ProductFormValues) => {
    const payload: CreateProductPayload = {
      ...formData,
      price: Number(formData.price),
      stockQuantity: formData.stockQuantity
        ? Number(formData.stockQuantity)
        : undefined,
      categoryId: formData.categoryId || undefined,
      imageUrl: formData.imageUrl || undefined,
      providerIds: selectedProviderIds.length > 0 ? selectedProviderIds : undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
        navigate(`/products/${id}`);
      } else {
        const result = await createMutation.mutateAsync(payload);
        navigate(`/products/${result.data.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        for (const detail of err.details) {
          setError(detail.field as keyof ProductFormValues, {
            message: detail.message,
          });
        }
      } else if (err instanceof ApiError) {
        setError("root", { message: err.message });
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <button
        onClick={() => navigate(isEdit ? `/products/${id}` : "/products")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back
      </button>

      <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Product" : "New Product"}
        </h1>

        {errors.root && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField label="Name" error={errors.name}>
            <input
              {...register("name", { required: "Name is required" })}
              className={inputClass}
            />
          </FormField>

          <FormField label="Price" error={errors.price}>
            <input
              type="number"
              step="0.01"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Price must be >= 0" },
                valueAsNumber: true,
              })}
              className={inputClass}
            />
          </FormField>

          <FormField label="Description" error={errors.description}>
            <textarea
              {...register("description")}
              rows={3}
              className={inputClass}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="SKU" error={errors.sku}>
              <input {...register("sku")} className={inputClass} />
            </FormField>

            <FormField label="Stock Quantity" error={errors.stockQuantity}>
              <input
                type="number"
                {...register("stockQuantity", {
                  min: { value: 0, message: "Must be >= 0" },
                  valueAsNumber: true,
                })}
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="Category" error={errors.categoryId}>
            <select {...register("categoryId")} className={inputClass}>
              <option value="">No category</option>
              {categoriesData?.data.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Image URL" error={errors.imageUrl}>
            <input
              type="url"
              {...register("imageUrl")}
              placeholder="https://..."
              className={inputClass}
            />
          </FormField>

          <FormField label="Active" error={errors.isActive}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Product is active</span>
            </label>
          </FormField>

          {/* Provider multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Providers
            </label>
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-300 p-2">
              {providersData?.data.length === 0 && (
                <p className="text-sm text-gray-500">No providers available</p>
              )}
              {providersData?.data.map((prov) => (
                <label
                  key={prov.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedProviderIds.includes(prov.id!)}
                    onChange={() => toggleProvider(prov.id!)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{prov.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
