import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductListPage } from "./pages/products/ProductListPage";
import { ProductDetailPage } from "./pages/products/ProductDetailPage";
import { ProductFormPage } from "./pages/products/ProductFormPage";
import { ProviderListPage } from "./pages/providers/ProviderListPage";
import { ProviderDetailPage } from "./pages/providers/ProviderDetailPage";
import { ProviderFormPage } from "./pages/providers/ProviderFormPage";
import { CategoryListPage } from "./pages/categories/CategoryListPage";
import { CategoryDetailPage } from "./pages/categories/CategoryDetailPage";
import { CategoryFormPage } from "./pages/categories/CategoryFormPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />

          <Route path="providers" element={<ProviderListPage />} />
          <Route path="providers/new" element={<ProviderFormPage />} />
          <Route path="providers/:id" element={<ProviderDetailPage />} />
          <Route path="providers/:id/edit" element={<ProviderFormPage />} />

          <Route path="categories" element={<CategoryListPage />} />
          <Route path="categories/new" element={<CategoryFormPage />} />
          <Route path="categories/:id" element={<CategoryDetailPage />} />
          <Route path="categories/:id/edit" element={<CategoryFormPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
