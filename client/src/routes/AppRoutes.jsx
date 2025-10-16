import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Spin } from "antd";

const HomePage = lazy(() => import("../pages/home/HomePage.jsx"));
const SearchPage = lazy(() => import("../pages/search/SearchPage.jsx"));
const ProductsPage = lazy(() => import("../pages/products/ProductsPage.jsx"));
const ProductDetailsPage = lazy(() => import("../pages/products/ProductDetailsPage.jsx"));

function SuspenseFallback() {
  return (
    <div className="route-fallback">
      <Spin size="large" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<SuspenseFallback />}>
            <HomePage />
          </Suspense>
        }
      />
      <Route
        path="/search"
        element={
          <Suspense fallback={<SuspenseFallback />}>
            <SearchPage />
          </Suspense>
        }
      />
      <Route
        path="/products"
        element={
          <Suspense fallback={<SuspenseFallback />}>
            <ProductsPage />
          </Suspense>
        }
      />
      <Route
        path="/products/:productId"
        element={
          <Suspense fallback={<SuspenseFallback />}>
            <ProductDetailsPage />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <main className="not-found">
            <h1>404</h1>
            <p>The page you are looking for does not exist.</p>
          </main>
        }
      />
    </Routes>
  );
}
