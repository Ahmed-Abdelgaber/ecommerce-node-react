import { useInfiniteQuery } from "@tanstack/react-query";
import { searchProducts } from "../services/searchApi";

export function useProductSearch(query, options = {}) {
  return useInfiniteQuery({
    queryKey: ["products", "search", query],
    queryFn: ({ pageParam = 1, signal }) =>
      searchProducts({ q: query, page: pageParam, size: options.pageSize, signal }),
    enabled: Boolean(query?.trim()),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasNext) return undefined;
      return (lastPage.page ?? 1) + 1;
    },
    ...options,
  });
}
