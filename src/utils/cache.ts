import { QueryClient } from '@tanstack/react-query';

/**
 * React Query configuration with aggressive caching
 * Implements stale-while-revalidate pattern
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: 7 days (keep data in cache)
      gcTime: 7 * 24 * 60 * 60 * 1000,

      // Stale time: 1 hour (consider data fresh)
      staleTime: 60 * 60 * 1000,

      // Retry failed requests once
      retry: 1,

      // Refetch on window focus (disabled to save API calls)
      refetchOnWindowFocus: false,

      // Refetch on reconnect (enabled with deduplication)
      refetchOnReconnect: true,

      // Refetch on mount (if stale)
      refetchOnMount: true,

      // De-duplicate concurrent requests
      networkMode: 'always',
    },
  },
});

/**
 * Cache key utilities
 */
export const cacheKeys = {
  package: (name: string, ecosystem: string = 'npm') =>
    ['package', ecosystem, name] as const,

  packages: (names: string[], ecosystem: string = 'npm') =>
    ['packages', ecosystem, names.sort()] as const,

  githubRepo: (repoUrl: string) =>
    ['github', 'repo', repoUrl] as const,

  githubReadme: (repoUrl: string) =>
    ['github', 'readme', repoUrl] as const,

  searchSuggestions: (query: string) =>
    ['search', 'suggestions', query] as const,
};
