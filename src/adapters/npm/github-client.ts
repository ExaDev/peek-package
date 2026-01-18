import { Octokit } from "octokit";
import type { GithubRepoResponse, GithubReadmeResponse } from "@/types/api";

interface OctokitError {
  status: number;
  message: string;
}

function isOctokitError(error: unknown): error is OctokitError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as OctokitError).status === "number"
  );
}

/**
 * Client for GitHub REST API (CORS-enabled)
 * Uses Octokit.js for API interactions
 * Rate limit: 60 req/hr unauthenticated, 5,000 req/hr with token
 */
export class GithubClient {
  private octokit: Octokit;

  constructor() {
    const token = this.getStoredToken();

    this.octokit = new Octokit({
      auth: token || undefined,
      userAgent: "Pickage-v1.0.0",
    });
  }

  /**
   * Get GitHub token from localStorage
   */
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem("github_token");
    } catch {
      return null;
    }
  }

  /**
   * Store GitHub token in localStorage
   */
  public setToken(token: string): void {
    try {
      localStorage.setItem("github_token", token);
      this.octokit = new Octokit({
        auth: token,
        userAgent: "Pickage-v1.0.0",
      });
    } catch (error) {
      console.error("Failed to store GitHub token:", error);
    }
  }

  /**
   * Clear stored GitHub token
   */
  public clearToken(): void {
    try {
      localStorage.removeItem("github_token");
      this.octokit = new Octokit({
        auth: undefined,
        userAgent: "Pickage-v1.0.0",
      });
    } catch (error) {
      console.error("Failed to clear GitHub token:", error);
    }
  }

  /**
   * Parse owner and repo from GitHub URL
   * Supports formats: github.com/owner/repo, github.com/owner/repo.js, git+https://github.com/owner/repo.git
   */
  private parseRepoUrl(url: string): { owner: string; repo: string } | null {
    // Match owner and repo, allowing dots in repo name (e.g., next.js)
    // Stop at .git suffix, query params, or end of string
    const match = url.match(
      /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:[?#]|$)/,
    );
    if (!match) return null;

    return {
      owner: match[1],
      repo: match[2],
    };
  }

  /**
   * Fetch repository information
   * @param repoUrl GitHub repository URL
   * @returns Repository metadata with error info, or null if invalid URL
   */
  async fetchRepository(repoUrl: string): Promise<
    | (GithubRepoResponse & {
        error?: "rate_limit" | "not_found" | "network_error";
        errorMessage?: string;
      })
    | null
  > {
    const parsed = this.parseRepoUrl(repoUrl);
    if (!parsed) {
      console.warn(`Invalid GitHub repository URL: ${repoUrl}`);
      return null;
    }

    try {
      const response = await this.octokit.request("GET /repos/{owner}/{repo}", {
        owner: parsed.owner,
        repo: parsed.repo,
      });

      return response.data as GithubRepoResponse;
    } catch (error: unknown) {
      // Return error information instead of just null
      if (isOctokitError(error)) {
        if (error.status === 404) {
          console.warn(`Repository not found: ${parsed.owner}/${parsed.repo}`);
          return {
            error: "not_found",
            errorMessage: "Repository not found",
          } as GithubRepoResponse & {
            error: "not_found";
            errorMessage: string;
          };
        } else if (error.status === 403) {
          console.warn(
            "GitHub API rate limit exceeded. Consider providing a GitHub token in settings.",
          );
          return {
            error: "rate_limit",
            errorMessage:
              "GitHub API rate limit exceeded. Add a token to increase limit.",
          } as GithubRepoResponse & {
            error: "rate_limit";
            errorMessage: string;
          };
        } else {
          console.warn("GitHub API error:", error.status, error.message);
          return {
            error: "network_error",
            errorMessage: `GitHub API error: ${error.message}`,
          } as GithubRepoResponse & {
            error: "network_error";
            errorMessage: string;
          };
        }
      } else {
        console.warn("GitHub API error:", error);
        return {
          error: "network_error",
          errorMessage: "Failed to fetch GitHub data",
        } as GithubRepoResponse & {
          error: "network_error";
          errorMessage: string;
        };
      }
    }
  }

  /**
   * Fetch README content
   * @param repoUrl GitHub repository URL
   * @returns README content (base64 encoded), or null if unavailable
   */
  async fetchReadme(repoUrl: string): Promise<GithubReadmeResponse | null> {
    const parsed = this.parseRepoUrl(repoUrl);
    if (!parsed) return null;

    try {
      const response = await this.octokit.request(
        "GET /repos/{owner}/{repo}/readme",
        {
          owner: parsed.owner,
          repo: parsed.repo,
        },
      );

      return response.data as GithubReadmeResponse;
    } catch (error: unknown) {
      // Gracefully handle errors - return null instead of throwing
      if (isOctokitError(error)) {
        if (error.status === 404) {
          // README doesn't exist
          return null;
        }
        if (error.status === 403) {
          // Rate limit exceeded - log warning but don't fail
          console.warn(
            "GitHub API rate limit exceeded for README. Consider providing a GitHub token.",
          );
          return null;
        }
      }
      // For other errors, log and return null to degrade gracefully
      console.warn("Failed to fetch README:", error);
      return null;
    }
  }

  /**
   * Get remaining rate limit
   */
  async getRateLimit(): Promise<{
    remaining: number;
    limit: number;
    reset: number;
  }> {
    try {
      const response = await this.octokit.request("GET /rate_limit");
      const { core } = response.data.resources;
      return {
        remaining: core.remaining,
        limit: core.limit,
        reset: core.reset,
      };
    } catch {
      return { remaining: 0, limit: 60, reset: Date.now() + 3600000 };
    }
  }
}
