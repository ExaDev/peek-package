/**
 * PyPI Packages client
 * Supports two datasets:
 * 1. Full PyPI (PEP 691 JSON) - 35MB, 726k packages (preferred)
 * 2. Top PyPI Packages - 790KB, 15k packages (fallback)
 *
 * This is a browser-compatible client using fetch()
 * No API key required - public APIs
 *
 * Note: Caching is handled by React Query, not this client
 */

import Fuse from "fuse.js";

export interface PopularPackage {
  project: string;
  download_count: number;
}

export interface FullPackage {
  name: string;
  version?: string;
  // PEP 691 may include more fields
}

export interface SearchOptions {
  limit?: number;
  threshold?: number; // Fuse.js threshold (0.0 = exact, 1.0 = match anything)
}

type PackageData = PopularPackage | FullPackage;

function isPopularPackage(pkg: PackageData): pkg is PopularPackage {
  return "project" in pkg;
}

export class PyPiPackagesClient {
  private popularDataUrl =
    "https://hugovk.github.io/top-pypi-packages/top-pypi-packages.min.json";
  private fullDataUrl =
    "https://pypi.org/simple/?format=application/vnd.pypi.simple.v1+json";

  /**
   * Fetch the full PyPI packages dataset (PEP 691 JSON format)
   * Returns 726k+ packages
   */
  async fetchFullPackages(): Promise<FullPackage[]> {
    const response = await fetch(this.fullDataUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch full PyPI packages: ${String(response.status)} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      meta: { api_version: string };
      projects: Array<{ name: string }>;
    };

    // PEP 691 format: returns a projects array
    return data.projects.map((project) => ({
      name: project.name,
    }));
  }

  /**
   * Fetch the popular PyPI packages dataset
   * Returns 15k most-downloaded packages
   */
  async fetchPopularPackages(): Promise<PopularPackage[]> {
    const response = await fetch(this.popularDataUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch popular packages: ${String(response.status)} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      rows: PopularPackage[];
    };

    return data.rows;
  }

  /**
   * Search for packages by name using Fuse.js fuzzy matching
   * @param packages The package list to search (from React Query cache)
   * @param query Search query
   * @param options Search options (limit, threshold)
   * @returns Array of matching packages
   */
  searchPackages(
    packages: PackageData[],
    query: string,
    options: SearchOptions = {},
  ): Array<{ name: string; download_count?: number }> {
    if (!query.trim()) {
      return [];
    }

    // Normalize packages to common format
    const normalizedPackages = packages.map((pkg) => ({
      name: isPopularPackage(pkg) ? pkg.project : pkg.name,
      download_count: isPopularPackage(pkg) ? pkg.download_count : undefined,
    }));

    const fuse = new Fuse(normalizedPackages, {
      keys: ["name"],
      // Higher threshold = more fuzzy (0.6 handles typos like "djnago" → "django")
      threshold: options.threshold ?? 0.6,
      distance: 100,
      minMatchCharLength: 2,
      shouldSort: true,
    });

    const results = fuse.search(query);
    const limited = results.slice(0, options.limit ?? 50);
    return limited.map((r) => r.item);
  }
}

/**
 * Singleton instance for use in hooks
 */
export const pypiPackagesClient = new PyPiPackagesClient();
