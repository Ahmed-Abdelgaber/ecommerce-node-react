import { useQuery } from "@tanstack/react-query";
import { listFeaturedCategories } from "../services/categoriesApi";

export function useFeaturedCategories(options = {}) {
  const size = options.size ?? 60;
  return useQuery({
    queryKey: ["categories", "featured", size],
    queryFn: () => listFeaturedCategories({ size }),
    staleTime: 10 * 60 * 1000,
  });
}
