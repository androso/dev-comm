import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProvider, useDeleteProvider } from "../../hooks/useProviders";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useProvider(id!);
  const deleteMutation = useDeleteProvider();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={refetch} />;

  const provider = data!.data;

  return (
    <div>
      <button
        onClick={() => navigate("/providers")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Providers
      </button>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {provider.name}
            </h1>
            <div className="mt-1">
              <StatusBadge isActive={provider.isActive} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/providers/${id}/edit`)}
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

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {provider.email || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {provider.phone || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {provider.address || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {provider.description || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(provider.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(provider.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          deleteMutation.mutate(id!, {
            onSuccess: () => navigate("/providers"),
          });
        }}
        title="Delete Provider"
        message="Are you sure you want to delete this provider? This action cannot be undone."
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
