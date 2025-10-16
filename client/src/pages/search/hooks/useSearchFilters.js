import { useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const DEFAULTS = {
  q: "",
  category: "",
  sort: "newest",
  inStock: false,
  minPrice: "",
  maxPrice: "",
};

function normalizeBoolean(value) {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false || value == null) return false;
  return Boolean(value);
}

function serialise(key, value) {
  if (value == null) return null;
  if (value === "") return null;
  if (typeof value === "boolean") return value ? "true" : null;
  return String(value);
}

export function useSearchFilters() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const filters = useMemo(() => {
    const q = params.get("q") ?? DEFAULTS.q;
    const category = params.get("category") ?? DEFAULTS.category;
    const sort = params.get("sort") ?? DEFAULTS.sort;
    const inStock = normalizeBoolean(params.get("inStock"));
    const minPrice = params.get("minPrice") ?? DEFAULTS.minPrice;
    const maxPrice = params.get("maxPrice") ?? DEFAULTS.maxPrice;
    return { q, category, sort, inStock, minPrice, maxPrice };
  }, [params]);

  const setFilter = useCallback(
    (key, value, { replace = true } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const serialised = serialise(key, value);
          if (serialised == null) {
            next.delete(key);
          } else {
            next.set(key, serialised);
          }
          return next;
        },
        { replace },
      );
    },
    [setParams],
  );

  const setFilters = useCallback(
    (patch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([key, value]) => {
            const serialised = serialise(key, value);
            if (serialised == null) {
              next.delete(key);
            } else {
              next.set(key, serialised);
            }
          });
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const resetFilters = useCallback(() => {
    const next = new URLSearchParams();
    navigate({ search: next.toString() }, { replace: true });
  }, [navigate]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
  };
}
