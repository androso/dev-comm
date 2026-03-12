import type { Meta } from "../../types/api";

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: Meta;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <p className="text-sm text-gray-700">
        Showing{" "}
        <span className="font-medium">{meta.offset + 1}</span> to{" "}
        <span className="font-medium">
          {Math.min(meta.offset + meta.limit, meta.totalItems)}
        </span>{" "}
        of <span className="font-medium">{meta.totalItems}</span> results
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
