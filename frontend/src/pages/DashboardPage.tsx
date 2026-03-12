import { useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useProviders } from "../hooks/useProviders";
import { useCategories } from "../hooks/useCategories";

function StatCard({
  title,
  count,
  isLoading,
  onClick,
  color,
}: {
  title: string;
  count: number;
  isLoading: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>
        {isLoading ? (
          <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-200" />
        ) : (
          count
        )}
      </p>
      <p className="mt-1 text-xs text-gray-400">View all &rarr;</p>
    </button>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const products = useProducts({ limit: 1 });
  const providers = useProviders({ limit: 1 });
  const categories = useCategories({ limit: 1 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Inventory management overview
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          title="Products"
          count={products.data?.meta.totalItems ?? 0}
          isLoading={products.isLoading}
          onClick={() => navigate("/products")}
          color="text-indigo-600"
        />
        <StatCard
          title="Providers"
          count={providers.data?.meta.totalItems ?? 0}
          isLoading={providers.isLoading}
          onClick={() => navigate("/providers")}
          color="text-emerald-600"
        />
        <StatCard
          title="Categories"
          count={categories.data?.meta.totalItems ?? 0}
          isLoading={categories.isLoading}
          onClick={() => navigate("/categories")}
          color="text-amber-600"
        />
      </div>
    </div>
  );
}
