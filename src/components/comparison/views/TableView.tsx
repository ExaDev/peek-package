import {
  ActionIcon,
  Badge,
  Group,
  Paper,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconRefresh, IconTrophy, IconX } from "@tabler/icons-react";
import type { ViewProps } from "./types";
import type { PackageStats } from "@/types/adapter";

/**
 * Format large numbers with K/M suffix
 */
function formatNumber(num: number | undefined): string {
  if (num === undefined) return "N/A";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Get badge color based on score value
 */
function getScoreColor(score: number | undefined): string {
  if (score === undefined) return "gray";
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}

/**
 * Metric row definitions
 */
interface MetricDef {
  key: string;
  label: string;
  format: (stats: PackageStats | null) => string;
  isScore?: boolean;
  skipWinner?: boolean; // Skip winner indicator for this metric
}

/**
 * Generate metrics dynamically based on package ecosystems
 */
function generateMetrics(packagesData: PackageStats[]): MetricDef[] {
  const hasNpm = packagesData.some((p) => p.npm);
  const hasPyPI = packagesData.some((p) => p.pypi);

  const metrics: MetricDef[] = [];

  // npm-specific metrics
  if (hasNpm) {
    metrics.push({
      key: "weeklyDownloads",
      label: "Weekly Downloads",
      format: (stats) => formatNumber(stats?.weeklyDownloads),
    });
    metrics.push({
      key: "dependentsCount",
      label: "Dependents",
      format: (stats) => formatNumber(stats?.dependentsCount),
    });
  }

  // PyPI-specific metrics
  if (hasPyPI) {
    metrics.push({
      key: "requiresPython",
      label: "Python Version",
      format: (stats) => stats?.pypi?.requiresPython ?? "Any",
      skipWinner: true,
    });
    metrics.push({
      key: "uploads",
      label: "Total Uploads",
      format: (stats) => String(stats?.pypi?.uploads ?? 0),
      skipWinner: true,
    });
  }

  // Shared metrics (always shown)
  metrics.push({
    key: "stars",
    label: "GitHub Stars",
    format: (stats) => formatNumber(stats?.stars),
  });
  metrics.push({
    key: "forks",
    label: "Forks",
    format: (stats) => formatNumber(stats?.forks),
  });

  // npms.io scores (only for npm packages)
  if (hasNpm) {
    metrics.push({
      key: "quality",
      label: "Quality Score",
      format: (stats) =>
        stats?.quality !== undefined ? `${String(stats.quality)}%` : "N/A",
      isScore: true,
    });
    metrics.push({
      key: "popularity",
      label: "Popularity Score",
      format: (stats) =>
        stats?.popularity !== undefined
          ? `${String(stats.popularity)}%`
          : "N/A",
      isScore: true,
    });
    metrics.push({
      key: "maintenance",
      label: "Maintenance Score",
      format: (stats) =>
        stats?.maintenance !== undefined
          ? `${String(stats.maintenance)}%`
          : "N/A",
      isScore: true,
    });
  }

  return metrics;
}

/**
 * Table view - metrics comparison table
 * Rows = metrics, Columns = packages
 * Most compact for pure metric comparison
 */
export function TableView({
  packages,
  packagesData,
  isLoading,
  winnerMetrics,
  canRemove,
  onRemove,
  refetchingPackages,
  onRefresh,
  // New props (not used in table view - uses legacy onRefresh)
  refetchingNpmPackages: _refetchingNpmPackages,
  onRefreshNpm: _onRefreshNpm,
  refetchingGithubPackages: _refetchingGithubPackages,
  onRefreshGithub: _onRefreshGithub,
}: ViewProps) {
  // Generate metrics dynamically based on package ecosystems
  const METRICS = generateMetrics(packagesData);

  if (isLoading) {
    return (
      <Paper p="xl" radius="md" withBorder>
        <Text c="dimmed" ta="center">
          Loading package data...
        </Text>
      </Paper>
    );
  }

  return (
    <Paper radius="md" withBorder>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ minWidth: 150 }}>Metric</Table.Th>
              {packages.map((pkg) => (
                <Table.Th key={pkg.id} style={{ minWidth: 150 }}>
                  <Group gap="xs" justify="space-between" wrap="nowrap">
                    <Text fw={600} truncate>
                      {pkg.packageName}
                    </Text>
                    <Group gap={4}>
                      <Tooltip label="Refresh data">
                        <ActionIcon
                          color="blue"
                          variant="subtle"
                          size="xs"
                          loading={refetchingPackages[pkg.packageName]}
                          onClick={() => {
                            onRefresh(pkg.packageName);
                          }}
                          aria-label={`Refresh ${pkg.packageName} data`}
                        >
                          <IconRefresh size={14} />
                        </ActionIcon>
                      </Tooltip>
                      {canRemove && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size="xs"
                          onClick={() => {
                            onRemove(pkg.id);
                          }}
                          aria-label={`Remove ${pkg.packageName}`}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {METRICS.map((metric) => (
              <Table.Tr key={metric.key}>
                <Table.Td>
                  <Text fw={500}>{metric.label}</Text>
                </Table.Td>
                {packages.map((pkg) => {
                  const stats =
                    packagesData.find((p) => p.name === pkg.packageName) ?? null;

                  // Extract numeric value for winner check and score color
                  let numericValue: number | undefined;
                  if (metric.key === "requiresPython") {
                    numericValue = undefined; // Skip winner for Python version
                  } else if (metric.key === "uploads") {
                    numericValue = stats?.pypi?.uploads;
                  } else {
                    numericValue = stats?.[metric.key as keyof typeof stats] as
                      | number
                      | undefined;
                  }

                  const pkgWinners = winnerMetrics[pkg.packageName];
                  const isWinner =
                    !metric.skipWinner &&
                    pkgWinners[metric.key] &&
                    packages.length > 1;

                  return (
                    <Table.Td key={pkg.id}>
                      <Group gap="xs" wrap="nowrap">
                        {metric.isScore ? (
                          <Badge
                            color={getScoreColor(numericValue)}
                            variant="light"
                            size="lg"
                          >
                            {metric.format(stats)}
                          </Badge>
                        ) : (
                          <Text>{metric.format(stats)}</Text>
                        )}
                        {isWinner && (
                          <Tooltip label="Best in category">
                            <IconTrophy
                              size={16}
                              style={{
                                color: "var(--mantine-color-orange-6)",
                              }}
                            />
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
