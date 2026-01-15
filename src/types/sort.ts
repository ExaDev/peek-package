export type SortDirection = "asc" | "desc";

// Fields that can be sorted
export type SortField =
  // npms.io scores
  | "finalScore"
  | "quality"
  | "popularity"
  | "maintenance"
  // npm registry
  | "weeklyDownloads"
  | "dependentsCount"
  // GitHub
  | "stars"
  | "forks"
  | "openIssues";

export interface SortCriterion {
  field: SortField;
  direction: SortDirection;
}

// Human-readable labels for sort fields
export const SORT_FIELD_LABELS: Record<SortField, string> = {
  finalScore: "Overall Score",
  quality: "Quality",
  popularity: "Popularity",
  maintenance: "Maintenance",
  weeklyDownloads: "Weekly Downloads",
  dependentsCount: "Dependents",
  stars: "Stars",
  forks: "Forks",
  openIssues: "Open Issues",
};

// Default sort direction for each field (most useful direction)
export const DEFAULT_SORT_DIRECTION: Record<SortField, SortDirection> = {
  finalScore: "desc",
  quality: "desc",
  popularity: "desc",
  maintenance: "desc",
  weeklyDownloads: "desc",
  dependentsCount: "desc",
  stars: "desc",
  forks: "desc",
  openIssues: "asc", // fewer issues is usually better
};
