import {
  Badge,
  Card,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { PackageStats } from "@/types/adapter";
import { IconTrophy } from "@tabler/icons-react";

interface PackageMetricsPanelProps {
  packageStats: PackageStats | null;
  isLoading: boolean;
  winnerMetrics?: {
    [key in keyof PackageStats]?: boolean;
  };
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
        {/* Package Name and Quality Score */}
        <Group justify="space-between">
          <Title order={4}>{packageStats.name}</Title>
          <Badge
            color={getScoreColor(packageStats.quality)}
            variant="light"
            leftSection={isQualityWinner ? <IconTrophy size={12} /> : undefined}
          >
            {packageStats.quality ?? "N/A"}/100
          </Badge>
        </Group>

        {/* Description */}
        <Text size="sm" c="dimmed" lineClamp={2}>
          {packageStats.description || "No description available"}
        </Text>

        <Divider />

        {/* Key Metrics */}
        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Weekly Downloads
            </Text>
            {isDownloadsWinner && <IconTrophy size={14} color="orange" />}
          </Group>
          <Text size="md" fw={isDownloadsWinner ? 700 : 400}>
            {formatNumber(packageStats.weeklyDownloads)}
          </Text>
        </Stack>

        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              GitHub Stars
            </Text>
            {isStarsWinner && <IconTrophy size={14} color="orange" />}
          </Group>
          <Text size="md" fw={isStarsWinner ? 700 : 400}>
            {formatNumber(packageStats.stars)}
          </Text>
        </Stack>

        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Forks
            </Text>
            {isForksWinner && <IconTrophy size={14} color="orange" />}
          </Group>
          <Text size="md" fw={isForksWinner ? 700 : 400}>
            {formatNumber(packageStats.forks)}
          </Text>
        </Stack>

        <Divider />

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
      </Stack>
    </Card>
  );
}
