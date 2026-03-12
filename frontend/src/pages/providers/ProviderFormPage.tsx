import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useProvider,
  useCreateProvider,
  useUpdateProvider,
} from "../../hooks/useProviders";
import { FormField } from "../../components/ui/FormField";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ApiError } from "../../api/client";
import type { CreateProviderPayload } from "../../types/provider";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function ProviderFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data, isLoading } = useProvider(id!);
  const createMutation = useCreateProvider();
  const updateMutation = useUpdateProvider();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateProviderPayload>();

  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      reset({
        name: p.name,
        address: p.address ?? undefined,
        phone: p.phone ?? undefined,
        description: p.description ?? undefined,
        email: p.email ?? undefined,
        isActive: p.isActive,
      });
    }
  }, [data, reset]);

  if (isEdit && isLoading) return <LoadingSpinner />;

  const onSubmit = async (formData: CreateProviderPayload) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: formData });
        navigate(`/providers/${id}`);
      } else {
        const result = await createMutation.mutateAsync(formData);
        navigate(`/providers/${result.data.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        for (const detail of err.details) {
          setError(detail.field as keyof CreateProviderPayload, {
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
        onClick={() => navigate(isEdit ? `/providers/${id}` : "/providers")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back
      </button>

      <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Provider" : "New Provider"}
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
                maxLength: { value: 255, message: "Max 255 characters" },
              })}
              className={inputClass}
            />
          </FormField>

          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              {...register("email")}
              className={inputClass}
            />
          </FormField>

          <FormField label="Phone" error={errors.phone}>
            <input
              {...register("phone", {
                maxLength: { value: 20, message: "Max 20 characters" },
              })}
              className={inputClass}
            />
          </FormField>

          <FormField label="Address" error={errors.address}>
            <input
              {...register("address", {
                maxLength: { value: 255, message: "Max 255 characters" },
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

          <FormField label="Active" error={errors.isActive}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Provider is active</span>
            </label>
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
