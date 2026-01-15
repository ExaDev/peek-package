import type { PackageStats } from "@/types/adapter";

export interface SectionProps {
  packageStats: PackageStats | null;
  isLoading: boolean;
}

export interface WinnerMetrics {
  quality?: boolean;
  popularity?: boolean;
  maintenance?: boolean;
  weeklyDownloads?: boolean;
  stars?: boolean;
  forks?: boolean;
  dependentsCount?: boolean;
}
