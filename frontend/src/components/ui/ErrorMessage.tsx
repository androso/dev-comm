import { ApiError } from "../../api/client";

export function ErrorMessage({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  const isApiError = error instanceof ApiError;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-800">
        {isApiError ? error.message : "Something went wrong"}
      </p>
      {isApiError && error.code && (
        <p className="mt-1 text-xs text-red-600">Code: {error.code}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
        >
          Retry
        </button>
      )}
    </div>
  );
}
