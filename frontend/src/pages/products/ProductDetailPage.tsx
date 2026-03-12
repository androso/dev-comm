import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct, useDeleteProduct } from "../../hooks/useProducts";
import { useCategory } from "../../hooks/useCategories";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { StatusBadge } from "../../components/ui/StatusBadge";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useProduct(id!);
  const deleteMutation = useDeleteProduct();
  const [showDelete, setShowDelete] = useState(false);

  const product = data?.data;
  const { data: categoryData } = useCategory(product?.categoryId ?? "");

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!product) return null;

  return (
    <div>
      <button
        onClick={() => navigate("/products")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Products
      </button>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-1 flex items-center gap-3">
              <StatusBadge isActive={product.isActive} />
              <span className="text-lg font-semibold text-indigo-600">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/products/${id}/edit`)}
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
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {product.description || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">SKU</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {product.sku || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Stock Quantity</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {product.stockQuantity ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {categoryData?.data.name || (product.categoryId ? "Loading..." : "—")}
            </dd>
          </div>
          {product.imageUrl && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Image</dt>
              <dd className="mt-1">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-40 w-40 rounded-lg object-cover"
                />
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(product.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(product.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>

        {/* Providers */}
        {product.providers && product.providers.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-500">Providers</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.providers.map((p) => (
                <span
                  key={p.id}
                  onClick={() => navigate(`/providers/${p.id}`)}
                  className="cursor-pointer rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          deleteMutation.mutate(id!, {
            onSuccess: () => navigate("/products"),
          });
        }}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
