import { useQuery } from '@tanstack/react-query';
import { NpmAdapter } from '@/adapters/npm';
import type { PkgCompareRequest } from '@/types/adapter';
import { cacheKeys } from '@/utils/cache';

const adapter = new NpmAdapter();

/**
 * Hook for fetching package data with caching
 */
export function usePackage(packageName: string, enabled: boolean = true) {
  return useQuery({
    queryKey: cacheKeys.package(packageName),
    queryFn: async () => {
      const request: PkgCompareRequest = {
        packageName,
        ecosystem: 'npm',
      };
      return adapter.fetch(request);
    },
    enabled: enabled && !!packageName,
    staleTime: 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook for comparing two packages
 */
export function usePackageComparison(package1: string, package2: string) {
  const result1 = usePackage(package1, !!package1);
  const result2 = usePackage(package2, !!package2);

  return {
    isLoading: result1.isLoading || result2.isLoading,
    isError: result1.isError || result2.isError,
    error: result1.error || result2.error,
    package1: result1.data,
    package2: result2.data,
  };
}
