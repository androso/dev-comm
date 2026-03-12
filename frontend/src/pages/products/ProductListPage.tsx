import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProducts, useDeleteProduct } from "../../hooks/useProducts";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { Product } from "../../types/product";

function formatCurrency(value: number | undefined) {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const columns: Column<Partial<Product>>[] = [
  { key: "name", header: "Name" },
  {
    key: "price",
    header: "Price",
    render: (item) => formatCurrency(item.price),
  },
  {
    key: "stockQuantity",
    header: "Stock",
    render: (item) => item.stockQuantity ?? "—",
  },
  {
    key: "isActive",
    header: "Status",
    render: (item) =>
      item.isActive !== undefined ? (
        <StatusBadge isActive={item.isActive} />
      ) : (
        "—"
      ),
  },
];

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";

  const query = {
    page,
    limit: 10,
    fields: "id,name,price,stockQuantity,isActive",
    ...(search && { "name[like]": search }),
    ...(priceMin && { "price[gte]": Number(priceMin) }),
    ...(priceMax && { "price[lte]": Number(priceMax) }),
  };

  const { data, isLoading, isError, error, refetch } = useProducts(query);
  const deleteMutation = useDeleteProduct();

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    setSearchParams(params);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => navigate("/products/new")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Product
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-full max-w-sm">
          <SearchInput
            value={search}
            onChange={(val) => updateParams({ search: val, page: "" })}
            placeholder="Search products..."
          />
        </div>
        <input
          type="number"
          placeholder="Min price"
          value={priceMin}
          onChange={(e) => updateParams({ priceMin: e.target.value, page: "" })}
          className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="Max price"
          value={priceMax}
          onChange={(e) => updateParams({ priceMax: e.target.value, page: "" })}
          className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {isError ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : (
        <>
          <DataTable
            columns={[
              ...columns,
              {
                key: "actions",
                header: "",
                render: (item) => (
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/products/${item.id}/edit`)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id!)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            data={data?.data ?? []}
            isLoading={isLoading}
            onRowClick={(item) => navigate(`/products/${item.id}`)}
          />
          {data?.meta && (
            <Pagination
              meta={data.meta}
              onPageChange={(p) => updateParams({ page: String(p) })}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
