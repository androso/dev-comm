import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCategory, useDeleteCategory } from "../../hooks/useCategories";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useCategory(id!);
  const deleteMutation = useDeleteCategory();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={refetch} />;

  const category = data!.data;

  return (
    <div>
      <button
        onClick={() => navigate("/categories")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Categories
      </button>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/categories/${id}/edit`)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <dl className="mt-6 space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {category.description || "No description"}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(category.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(category.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          deleteMutation.mutate(id!, {
            onSuccess: () => navigate("/categories"),
          });
        }}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
