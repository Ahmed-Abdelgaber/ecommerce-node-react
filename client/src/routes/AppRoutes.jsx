import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Spin } from "antd";

function SuspenseFallback() {
  return (
    <div className="route-fallback">
      <Spin size="large" />
    </div>
  );
}

function Placeholder() {
  return <div style={{ padding: "2rem", textAlign: "center" }}>Welcome. UI rebuild in progress.</div>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<SuspenseFallback />}>
            <Placeholder />
          </Suspense>
        }
      />
      <Route path="*" element={<Placeholder />} />
    </Routes>
  );
}
