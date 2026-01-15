import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import type { PackageStats } from "@/types/adapter";
import {
  IconBrandGithub,
  IconBrandNpm,
  IconRefresh,
  IconTrophy,
} from "@tabler/icons-react";

interface PackageMetricsPanelProps {
  packageStats: PackageStats | null;
  isLoading: boolean;
  winnerMetrics?: {
    [key in keyof PackageStats]?: boolean;
  };
  isRefetchingNpm?: boolean;
  isRefetchingGithub?: boolean;
  onRefreshNpm?: () => void;
  onRefreshGithub?: () => void;
}

function formatNumber(value: number | undefined): string {
  if (value === undefined) return "N/A";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function getScoreColor(score: number | undefined): "green" | "yellow" | "red" {
  if (score === undefined) return "red";
  if (score > 80) return "green";
  if (score > 60) return "yellow";
  return "red";
}

export function PackageMetricsPanel({
  packageStats,
  isLoading,
  winnerMetrics = {},
  isRefetchingNpm = false,
  isRefetchingGithub = false,
  onRefreshNpm,
  onRefreshGithub,
}: PackageMetricsPanelProps) {
  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" withBorder>
        <Stack gap="md">
          <Skeleton height={28} width="60%" />
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="80%" />
          <Divider />
          <Stack gap={4}>
            <Skeleton height={12} width="40%" />
            <Skeleton height={20} width="60%" />
          </Stack>
          <Stack gap={4}>
            <Skeleton height={12} width="40%" />
            <Skeleton height={20} width="60%" />
          </Stack>
        </Stack>
      </Card>
    );
  }

  if (!packageStats) {
    return (
      <Card shadow="sm" padding="lg" withBorder opacity={0.5}>
        <Stack gap="md" align="center">
          <Text c="dimmed" size="sm" ta="center">
            Enter a package name to see metrics
          </Text>
        </Stack>
      </Card>
    );
  }

  const isQualityWinner = winnerMetrics.quality;
  const isPopularityWinner = winnerMetrics.popularity;
  const isMaintenanceWinner = winnerMetrics.maintenance;
  const isDownloadsWinner = winnerMetrics.weeklyDownloads;
  const isStarsWinner = winnerMetrics.stars;
  const isForksWinner = winnerMetrics.forks;

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Stack gap="md">
        {/* Quality Score Badge */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed" lineClamp={2} style={{ flex: 1 }}>
            {packageStats.description || "No description available"}
          </Text>
          <Badge
            color={getScoreColor(packageStats.quality)}
            variant="light"
            leftSection={isQualityWinner ? <IconTrophy size={12} /> : undefined}
          >
            {packageStats.quality ?? "N/A"}/100
          </Badge>
        </Group>

        <Divider />

        {/* npm Data Section */}
        <Box>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconBrandNpm size={18} color="var(--mantine-color-red-6)" />
              <Text size="sm" fw={600}>
                npm
              </Text>
            </Group>
            {onRefreshNpm && (
              <Tooltip label="Refresh npm data">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  loading={isRefetchingNpm}
                  onClick={onRefreshNpm}
                  aria-label="Refresh npm data"
                >
                  <IconRefresh size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Weekly Downloads
              </Text>
              <Group gap={4}>
                {isDownloadsWinner && <IconTrophy size={12} color="orange" />}
                <Text size="sm" fw={isDownloadsWinner ? 700 : 400}>
                  {formatNumber(packageStats.weeklyDownloads)}
                </Text>
              </Group>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                License
              </Text>
              <Text size="sm">{packageStats.npm?.license ?? "N/A"}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Dependencies
              </Text>
              <Text size="sm">
                {packageStats.npm?.dependencies.length ?? 0}
              </Text>
            </Group>
          </Stack>
        </Box>

        {/* Score Badges */}
        <Group gap="xs" wrap="wrap">
          <Text size="xs" c="dimmed">
            Quality:
          </Text>
          <Badge
            size="xs"
            color={getScoreColor(packageStats.quality)}
            leftSection={isQualityWinner ? <IconTrophy size={10} /> : undefined}
          >
            {packageStats.quality ?? "N/A"}
          </Badge>

          <Text size="xs" c="dimmed">
            Popularity:
          </Text>
          <Badge
            size="xs"
            color={getScoreColor(packageStats.popularity)}
            leftSection={
              isPopularityWinner ? <IconTrophy size={10} /> : undefined
            }
          >
            {packageStats.popularity ?? "N/A"}
          </Badge>

          <Text size="xs" c="dimmed">
            Maintenance:
          </Text>
          <Badge
            size="xs"
            color={getScoreColor(packageStats.maintenance)}
            leftSection={
              isMaintenanceWinner ? <IconTrophy size={10} /> : undefined
            }
          >
            {packageStats.maintenance ?? "N/A"}
          </Badge>
        </Group>

        <Divider />

        {/* GitHub Data Section */}
        <Box>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconBrandGithub size={18} />
              <Text size="sm" fw={600}>
                GitHub
              </Text>
            </Group>
            {onRefreshGithub && (
              <Tooltip label="Refresh GitHub data">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  loading={isRefetchingGithub}
                  onClick={onRefreshGithub}
                  aria-label="Refresh GitHub data"
                >
                  <IconRefresh size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Stars
              </Text>
              <Group gap={4}>
                {isStarsWinner && <IconTrophy size={12} color="orange" />}
                <Text size="sm" fw={isStarsWinner ? 700 : 400}>
                  {formatNumber(packageStats.stars)}
                </Text>
              </Group>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Forks
              </Text>
              <Group gap={4}>
                {isForksWinner && <IconTrophy size={12} color="orange" />}
                <Text size="sm" fw={isForksWinner ? 700 : 400}>
                  {formatNumber(packageStats.forks)}
                </Text>
              </Group>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Open Issues
              </Text>
              <Text size="sm">{formatNumber(packageStats.openIssues)}</Text>
            </Group>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
