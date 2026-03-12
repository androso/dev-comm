import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCategories, useDeleteCategory } from "../../hooks/useCategories";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import type { Category } from "../../types/category";

const columns: Column<Partial<Category>>[] = [
  { key: "name", header: "Name" },
  {
    key: "description",
    header: "Description",
    render: (item) => (
      <span className="max-w-xs truncate block">
        {item.description || "—"}
      </span>
    ),
  },
];

export function CategoryListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  const query = {
    page,
    limit: 10,
    ...(search && { "name[like]": search }),
  };

  const { data, isLoading, isError, error, refetch } = useCategories(query);
  const deleteMutation = useDeleteCategory();

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
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => navigate("/categories/new")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Category
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={(val) => updateParams({ search: val, page: "" })}
          placeholder="Search categories..."
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
                      onClick={() => navigate(`/categories/${item.id}/edit`)}
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
            onRowClick={(item) => navigate(`/categories/${item.id}`)}
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
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
