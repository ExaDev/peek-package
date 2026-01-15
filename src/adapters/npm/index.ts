import type { EcosystemAdapter, PkgCompareRequest, PackageStats } from '@/types/adapter';
import { NpmsClient } from './npms-client';
import { GithubClient } from './github-client';

/**
 * npm ecosystem adapter implementing EcosystemAdapter interface
 * Fetches data from npms.io and GitHub APIs
 */
export class NpmAdapter implements EcosystemAdapter {
  private npmsClient: NpmsClient;
  private githubClient: GithubClient;

  constructor() {
    this.npmsClient = new NpmsClient();
    this.githubClient = new GithubClient();
  }

  /**
   * Fetch package statistics from all sources
   */
  async fetch(request: PkgCompareRequest): Promise<PackageStats> {
    const npmsData = await this.npmsClient.fetchPackage(request.packageName);

    // Parse the nested npms.io response structure
    const collected = (npmsData as any).collected || {};
    const metadata = collected.metadata || {};
    const links = metadata.links || {};
    const score = (npmsData as any).score?.detail || {};
    const npmData = collected.npm || {};
    const githubData = collected.github || {};

    const stats: PackageStats = {
      name: metadata.name || request.packageName,
      description: metadata.description || null,
      version: metadata.version || '0.0.0',
      homepage: links.homepage || null,
      repository: links.repository || null,
      quality: score.quality,
      popularity: score.popularity,
      maintenance: score.maintenance,
      weeklyDownloads: npmData.downloads?.[0]?.count,
    };

    stats.npm = {
      dependencies: Object.keys(metadata.dependencies || {}),
      devDependencies: Object.keys(metadata.devDependencies || {}),
      peerDependencies: metadata.peerDependencies || {},
      license: metadata.license || 'UNKNOWN',
      size: 0,
      keywords: metadata.keywords || [],
    };

    // Use GitHub data from npms.io if available
    if (githubData.starsCount !== undefined) {
      stats.stars = githubData.starsCount;
      stats.forks = githubData.forksCount;
      stats.openIssues = githubData.issues?.openCount;

      stats.github = {
        stars: githubData.starsCount,
        forks: githubData.forksCount,
        openIssues: githubData.issues?.openCount || 0,
        subscribers: githubData.subscribersCount || 0,
        createdAt: '', // Not available in npms.io
        updatedAt: '',
        pushedAt: '',
        defaultBranch: 'main',
        readme: null,
        homepageUrl: links.homepage || '',
      };
    }

    // Try to fetch additional data from GitHub API if repository URL exists
    if (links.repository) {
      try {
        const githubRepo = await this.githubClient.fetchRepository(links.repository);

        stats.stars = githubRepo.stargazers_count;
        stats.forks = githubRepo.forks_count;
        stats.openIssues = githubRepo.open_issues_count;

        stats.github = {
          stars: githubRepo.stargazers_count,
          forks: githubRepo.forks_count,
          openIssues: githubRepo.open_issues_count,
          subscribers: githubRepo.subscribers_count,
          createdAt: githubRepo.created_at,
          updatedAt: githubRepo.updated_at,
          pushedAt: githubRepo.pushed_at,
          defaultBranch: githubRepo.default_branch,
          readme: null,
          homepageUrl: githubRepo.homepage || '',
        };

        const readme = await this.githubClient.fetchReadme(links.repository);
        if (readme) {
          stats.github.readme = this.base64ToString(readme.content);
        }
      } catch (error) {
        console.warn('Failed to fetch GitHub data:', error);
      }
    }

    return stats;
  }

  /**
   * Check if adapter supports the ecosystem
   */
  supports(ecosystem: string): boolean {
    return ecosystem === 'npm';
  }

  /**
   * Convert base64 to string
   */
  private base64ToString(base64: string): string {
    const decoded = atob(base64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
}
