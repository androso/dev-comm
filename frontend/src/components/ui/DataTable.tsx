import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
}) {
  if (isLoading) return <LoadingSpinner />;
  if (data.length === 0) return <EmptyState />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, idx) => (
            <tr
              key={(item.id as string) ?? idx}
              onClick={() => onRowClick?.(item)}
              className={
                onRowClick
                  ? "cursor-pointer hover:bg-gray-50"
                  : "hover:bg-gray-50"
              }
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {col.render
                    ? col.render(item)
                    : (item[col.key] as React.ReactNode) ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
