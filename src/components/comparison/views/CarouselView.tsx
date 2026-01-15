import { Box, Card, ScrollArea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  HeaderSection,
  NpmsScoresSection,
  ComparisonResultsSection,
  NpmRegistrySection,
  GitHubSection,
  ReadmeSection,
} from "../sections";
import type { WinnerMetrics } from "../sections/types";
import type { ViewProps } from "./types";

const MOBILE_BREAKPOINT = 1024;

/**
 * Carousel view - horizontal layout with aligned sections using CSS Grid subgrid
 * Each section row aligns across all package columns
 */
export function CarouselView({
  packages,
  packagesData,
  isLoading,
  winnerMetrics,
  canRemove,
  onRemove,
  refetchingNpmPackages,
  onRefreshNpm,
  refetchingGithubPackages,
  onRefreshGithub,
}: ViewProps) {
  const isMobile = useMediaQuery(`(max-width: ${String(MOBILE_BREAKPOINT)}px)`);
  const columnCount = packages.length;

  // Calculate column sizing based on count
  // 1-2 packages: flexible, fill available space
  // 3+ packages: fixed width with horizontal scroll
  const useFlexibleLayout = columnCount <= 2;
  const columnMinWidth = isMobile ? 320 : useFlexibleLayout ? 400 : 450;

  return (
    <ScrollArea
      style={{ height: "100%", width: "100%" }}
      type="auto"
      offsetScrollbars
    >
      <Box
        style={{
          display: "grid",
          // One column per package
          gridTemplateColumns: useFlexibleLayout
            ? `repeat(${String(columnCount)}, minmax(${String(columnMinWidth)}px, 1fr))`
            : `repeat(${String(columnCount)}, ${String(columnMinWidth)}px)`,
          // 6 rows: header, scores, comparison, npm, github, readme
          gridTemplateRows: "auto auto auto auto auto auto",
          gap: "var(--mantine-spacing-lg)",
          padding: "var(--mantine-spacing-md)",
          minHeight: "100%",
          width: useFlexibleLayout ? "100%" : undefined,
          minWidth: useFlexibleLayout ? undefined : "min-content",
        }}
      >
        {packages.map((pkg, colIndex) => {
          const packageStats =
            packagesData.find((p) => p.name === pkg.packageName) ?? null;

          const packageWinners = winnerMetrics[pkg.packageName] ?? {};
          const pkgWinnerMetrics: WinnerMetrics = {
            quality: packageWinners.quality,
            popularity: packageWinners.popularity,
            maintenance: packageWinners.maintenance,
            weeklyDownloads: packageWinners.weeklyDownloads,
            stars: packageWinners.stars,
            forks: packageWinners.forks,
            dependentsCount: packageWinners.dependentsCount,
          };

          return (
            <Card
              key={pkg.id}
              shadow="sm"
              padding={0}
              withBorder
              style={{
                // Span all 6 rows
                gridColumn: colIndex + 1,
                gridRow: "1 / -1",
                // Use subgrid to align with parent grid rows
                display: "grid",
                gridTemplateRows: "subgrid",
              }}
            >
              {/* Row 1: Header */}
              <HeaderSection
                packageName={pkg.packageName}
                packageStats={packageStats}
                isLoading={isLoading}
                showRemove={canRemove}
                onRemove={() => {
                  onRemove(pkg.id);
                }}
              />

              {/* Row 2: npms.io Scores */}
              <NpmsScoresSection
                packageStats={packageStats}
                isLoading={isLoading}
              />

              {/* Row 3: Comparison Results */}
              <Box>
                <ComparisonResultsSection winnerMetrics={pkgWinnerMetrics} />
              </Box>

              {/* Row 4: npm Registry */}
              <NpmRegistrySection
                packageStats={packageStats}
                isLoading={isLoading}
                isRefetchingNpm={refetchingNpmPackages[pkg.packageName]}
                onRefreshNpm={() => {
                  onRefreshNpm(pkg.packageName);
                }}
              />

              {/* Row 5: GitHub */}
              <GitHubSection
                packageStats={packageStats}
                isLoading={isLoading}
                isRefetchingGithub={refetchingGithubPackages[pkg.packageName]}
                onRefreshGithub={() => {
                  onRefreshGithub(pkg.packageName);
                }}
              />

              {/* Row 6: README */}
              <Box style={{ overflow: "auto" }}>
                <ReadmeSection packageStats={packageStats} />
              </Box>
            </Card>
          );
        })}
      </Box>
    </ScrollArea>
  );
}
