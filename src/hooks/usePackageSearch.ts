import { useQuery } from '@tanstack/react-query';
import { NpmsClient } from '@/adapters/npm/npms-client';
import { cacheKeys } from '@/utils/cache';

const npmsClient = new NpmsClient();

export interface UsePackageSearchOptions {
  enabled?: boolean;
}

/**
 * Hook for searching npm packages with debouncing and caching
 *
 * @param query - Search query string
 * @param options - Configuration options
 * @returns Query result with search suggestions
 *
 * @example
 * const { data, isLoading } = usePackageSearch('react');
 * // data.results contains array of package suggestions
 */
export function usePackageSearch(
  query: string,
  options: UsePackageSearchOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: cacheKeys.searchSuggestions(query),
    queryFn: () => npmsClient.fetchSuggestions(query),
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 6 * 60 * 60 * 1000, // 6 hours
    retry: 1,
  });
}
