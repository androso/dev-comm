import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from "../../hooks/useCategories";
import { FormField } from "../../components/ui/FormField";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ApiError } from "../../api/client";
import type { CreateCategoryPayload } from "../../types/category";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function CategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data, isLoading } = useCategory(id!);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryPayload>();

  useEffect(() => {
    if (data?.data) {
      reset({
        name: data.data.name,
        description: data.data.description ?? undefined,
      });
    }
  }, [data, reset]);

  if (isEdit && isLoading) return <LoadingSpinner />;

  const onSubmit = async (formData: CreateCategoryPayload) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: formData });
        navigate(`/categories/${id}`);
      } else {
        const result = await createMutation.mutateAsync(formData);
        navigate(`/categories/${result.data.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        for (const detail of err.details) {
          setError(detail.field as keyof CreateCategoryPayload, {
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
        onClick={() => navigate(isEdit ? `/categories/${id}` : "/categories")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back
      </button>

      <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Category" : "New Category"}
        </h1>

        {errors.root && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField label="Name" error={errors.name}>
            <input
              {...register("name", {
                required: "Name is required",
                maxLength: { value: 50, message: "Max 50 characters" },
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
