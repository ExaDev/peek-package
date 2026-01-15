import type { NpmsPackageResponse } from '@/types/api';

/**
 * Client for npms.io API (CORS-enabled)
 * API Documentation: https://api-docs.npms.io/
 */
export class NpmsClient {
  private readonly baseUrl = 'https://api.npms.io/v2';

  /**
   * Fetch package metadata from npms.io
   * @param packageName Name of the npm package
   * @returns Package metadata with scores
   */
  async fetchPackage(packageName: string): Promise<NpmsPackageResponse> {
    const url = `${this.baseUrl}/package/${encodeURIComponent(packageName)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Package "${packageName}" not found on npms.io`);
      }
      throw new Error(`npms.io API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch multiple packages in a single request
   * @param packageNames Array of package names
   * @returns Record mapping package names to their metadata
   */
  async fetchPackages(packageNames: string[]): Promise<Record<string, NpmsPackageResponse>> {
    const url = `${this.baseUrl}/package/mget`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(packageNames),
    });

    if (!response.ok) {
      throw new Error(`npms.io batch API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
