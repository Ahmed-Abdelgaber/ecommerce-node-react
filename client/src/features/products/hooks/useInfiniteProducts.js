import { useInfiniteQuery } from "@tanstack/react-query";
import { listProducts } from "../services/productsApi";

export function useInfiniteProducts(options = {}) {
  const { enabled = true, sort = "newest", pageSize = 12, filters = {} } = options;

  return useInfiniteQuery({
    queryKey: ["products", "infinite", sort, filters],
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1, signal }) =>
      listProducts({
        page: pageParam,
        size: pageSize,
        sort,
        ...filters,
        signal,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasNext) return undefined;
      return (lastPage.page ?? 1) + 1;
    },
  });
}
