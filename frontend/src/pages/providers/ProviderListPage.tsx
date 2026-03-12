import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProviders, useDeleteProvider } from "../../hooks/useProviders";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { Provider } from "../../types/provider";

const columns: Column<Partial<Provider>>[] = [
  { key: "name", header: "Name" },
  {
    key: "email",
    header: "Email",
    render: (item) => item.email || "—",
  },
  {
    key: "phone",
    header: "Phone",
    render: (item) => item.phone || "—",
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

export function ProviderListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  const query = {
    page,
    limit: 10,
    fields: "id,name,email,phone,isActive",
    ...(search && { "name[like]": search }),
  };

  const { data, isLoading, isError, error, refetch } = useProviders(query);
  const deleteMutation = useDeleteProvider();

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
        <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
        <button
          onClick={() => navigate("/providers/new")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Provider
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={(val) => updateParams({ search: val, page: "" })}
          placeholder="Search providers..."
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
                      onClick={() => navigate(`/providers/${item.id}/edit`)}
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
            onRowClick={(item) => navigate(`/providers/${item.id}`)}
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
        title="Delete Provider"
        message="Are you sure you want to delete this provider? This action cannot be undone."
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
