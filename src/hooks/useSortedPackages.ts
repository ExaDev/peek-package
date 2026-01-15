import { useMemo } from "react";
import type { PackageColumnState } from "./usePackageColumn";
import type { PackageStats } from "@/types/adapter";
import type { SortCriterion, SortField } from "@/types/sort";

/**
 * Extract a sortable value from package stats
 */
function getFieldValue(
  stats: PackageStats | null,
  field: SortField,
): number | null {
  if (!stats) return null;

  switch (field) {
    // npms.io scores
    case "finalScore":
      return stats.finalScore ?? null;
    case "quality":
      return stats.quality ?? null;
    case "popularity":
      return stats.popularity ?? null;
    case "maintenance":
      return stats.maintenance ?? null;
    // npm registry
    case "weeklyDownloads":
      return stats.weeklyDownloads ?? null;
    case "dependentsCount":
      return stats.dependentsCount ?? null;
    // GitHub
    case "stars":
      return stats.stars ?? null;
    case "forks":
      return stats.forks ?? null;
    case "openIssues":
      return stats.openIssues ?? null;
    default:
      return null;
  }
}

/**
 * Compare two values for sorting
 * Null values are sorted last
 */
function compareValues(
  a: number | null,
  b: number | null,
  direction: "asc" | "desc",
): number {
  // Null values go last
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;

  const comparison = a - b;
  return direction === "asc" ? comparison : -comparison;
}

/**
 * Hook to sort packages based on sort criteria
 */
export function useSortedPackages(
  packages: PackageColumnState[],
  packagesData: PackageStats[],
  sortCriteria: SortCriterion[],
): PackageColumnState[] {
  return useMemo(() => {
    if (sortCriteria.length === 0) {
      return packages;
    }

    // Create a map for quick stats lookup
    const statsMap = new Map<string, PackageStats>();
    for (const stats of packagesData) {
      statsMap.set(stats.name, stats);
    }

    return [...packages].sort((a, b) => {
      const statsA = statsMap.get(a.packageName) ?? null;
      const statsB = statsMap.get(b.packageName) ?? null;

      // Apply each sort criterion in order
      for (const criterion of sortCriteria) {
        const valueA = getFieldValue(statsA, criterion.field);
        const valueB = getFieldValue(statsB, criterion.field);
        const comparison = compareValues(valueA, valueB, criterion.direction);

        if (comparison !== 0) {
          return comparison;
        }
      }

      // Stable sort: use package name as final tiebreaker
      return a.packageName.localeCompare(b.packageName);
    });
  }, [packages, packagesData, sortCriteria]);
}
