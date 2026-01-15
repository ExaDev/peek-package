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
 * Grid row definitions for aligned layout.
 * Each section defines its rows, and sections use subgrid to inherit sizing.
 */
const GRID_ROWS = {
  // Header section rows
  header: {
    title: 1, // Package name + remove button
    description: 1, // Description text
    badges: 1, // Version + language badges
    links: 1, // External links
  },
  // Scores section rows
  scores: {
    title: 1, // Section header
    overall: 1, // Overall score badge
    mainBadges: 1, // Quality/Popularity/Maintenance
    qualityTitle: 1, // "Quality Breakdown"
    tests: 1,
    health: 1,
    carefulness: 1,
    branding: 1,
    maintTitle: 1, // "Maintenance Breakdown"
    releasesFreq: 1,
    commitsFreq: 1,
    openIssues: 1,
    issuesDist: 1,
  },
  // Comparison section
  comparison: {
    badges: 1, // Winner badges
  },
  // npm Registry section rows
  npm: {
    title: 1,
    downloads: 1,
    dependents: 1,
    license: 1,
    dependencies: 1,
    devDeps: 1,
    peerDeps: 1,
    keywords: 1,
    author: 1,
    maintainers: 1,
  },
  // GitHub section rows
  github: {
    title: 1,
    stars: 1,
    forks: 1,
    issues: 1,
    watchers: 1,
    lastPush: 1,
    created: 1,
    updated: 1,
    size: 1,
    branch: 1,
    contributors: 1,
  },
  // README section
  readme: {
    content: 1,
  },
};

// Calculate row counts for each section
const SECTION_ROW_COUNTS = {
  header: Object.keys(GRID_ROWS.header).length,
  scores: Object.keys(GRID_ROWS.scores).length,
  comparison: Object.keys(GRID_ROWS.comparison).length,
  npm: Object.keys(GRID_ROWS.npm).length,
  github: Object.keys(GRID_ROWS.github).length,
  readme: Object.keys(GRID_ROWS.readme).length,
};

const TOTAL_ROWS = Object.values(SECTION_ROW_COUNTS).reduce((a, b) => a + b, 0);

// Calculate starting row for each section
const SECTION_START_ROWS = {
  header: 1,
  scores: 1 + SECTION_ROW_COUNTS.header,
  comparison: 1 + SECTION_ROW_COUNTS.header + SECTION_ROW_COUNTS.scores,
  npm:
    1 +
    SECTION_ROW_COUNTS.header +
    SECTION_ROW_COUNTS.scores +
    SECTION_ROW_COUNTS.comparison,
  github:
    1 +
    SECTION_ROW_COUNTS.header +
    SECTION_ROW_COUNTS.scores +
    SECTION_ROW_COUNTS.comparison +
    SECTION_ROW_COUNTS.npm,
  readme:
    1 +
    SECTION_ROW_COUNTS.header +
    SECTION_ROW_COUNTS.scores +
    SECTION_ROW_COUNTS.comparison +
    SECTION_ROW_COUNTS.npm +
    SECTION_ROW_COUNTS.github,
};

// Export row counts for use by section components
export { SECTION_ROW_COUNTS };

/**
 * Carousel view - horizontal layout with aligned fields using CSS Grid subgrid
 * Every field row aligns across all package columns
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
          gridTemplateColumns: useFlexibleLayout
            ? `repeat(${String(columnCount)}, minmax(${String(columnMinWidth)}px, 1fr))`
            : `repeat(${String(columnCount)}, ${String(columnMinWidth)}px)`,
          gridTemplateRows: `repeat(${String(TOTAL_ROWS)}, auto)`,
          columnGap: "var(--mantine-spacing-lg)",
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

          const col = colIndex + 1;

          return (
            <Card
              key={pkg.id}
              shadow="sm"
              padding={0}
              withBorder
              style={{
                gridColumn: col,
                gridRow: `1 / ${String(TOTAL_ROWS + 1)}`,
                display: "grid",
                gridTemplateRows: "subgrid",
              }}
            >
              {/* Header Section */}
              <Box
                style={{
                  gridRow: `${String(SECTION_START_ROWS.header)} / span ${String(SECTION_ROW_COUNTS.header)}`,
                  display: "grid",
                  gridTemplateRows: "subgrid",
                }}
              >
                <HeaderSection
                  packageName={pkg.packageName}
                  packageStats={packageStats}
                  isLoading={isLoading}
                  showRemove={canRemove}
                  onRemove={() => {
                    onRemove(pkg.id);
                  }}
                  rowCount={SECTION_ROW_COUNTS.header}
                />
              </Box>

              {/* Scores Section */}
              <Box
                style={{
                  gridRow: `${String(SECTION_START_ROWS.scores)} / span ${String(SECTION_ROW_COUNTS.scores)}`,
                  display: "grid",
                  gridTemplateRows: "subgrid",
                }}
              >
                <NpmsScoresSection
                  packageStats={packageStats}
                  isLoading={isLoading}
                  rowCount={SECTION_ROW_COUNTS.scores}
                />
              </Box>

              {/* Comparison Section */}
              <Box
                style={{
                  gridRow: `${String(SECTION_START_ROWS.comparison)} / span ${String(SECTION_ROW_COUNTS.comparison)}`,
                  display: "grid",
                  gridTemplateRows: "subgrid",
                }}
              >
                <ComparisonResultsSection
                  winnerMetrics={pkgWinnerMetrics}
                  rowCount={SECTION_ROW_COUNTS.comparison}
                />
              </Box>

              {/* npm Registry Section */}
              <Box
                style={{
                  gridRow: `${String(SECTION_START_ROWS.npm)} / span ${String(SECTION_ROW_COUNTS.npm)}`,
                  display: "grid",
                  gridTemplateRows: "subgrid",
                }}
              >
                <NpmRegistrySection
                  packageStats={packageStats}
                  isLoading={isLoading}
                  isRefetchingNpm={refetchingNpmPackages[pkg.packageName]}
                  onRefreshNpm={() => {
                    onRefreshNpm(pkg.packageName);
                  }}
                  rowCount={SECTION_ROW_COUNTS.npm}
                />
              </Box>

              {/* GitHub Section */}
              <Box
                style={{
                  gridRow: `${String(SECTION_START_ROWS.github)} / span ${String(SECTION_ROW_COUNTS.github)}`,
                  display: "grid",
                  gridTemplateRows: "subgrid",
                }}
              >
                <GitHubSection
                  packageStats={packageStats}
                  isLoading={isLoading}
                  isRefetchingGithub={refetchingGithubPackages[pkg.packageName]}
                  onRefreshGithub={() => {
                    onRefreshGithub(pkg.packageName);
                  }}
                  rowCount={SECTION_ROW_COUNTS.github}
                />
              </Box>

              {/* README Section */}
              <Box
                style={{
                  gridRow: `${String(SECTION_START_ROWS.readme)} / span ${String(SECTION_ROW_COUNTS.readme)}`,
                  display: "grid",
                  gridTemplateRows: "subgrid",
                }}
              >
                <ReadmeSection
                  packageStats={packageStats}
                  rowCount={SECTION_ROW_COUNTS.readme}
                />
              </Box>
            </Card>
          );
        })}
      </Box>
    </ScrollArea>
  );
}
