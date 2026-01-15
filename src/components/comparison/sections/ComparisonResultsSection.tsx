import { Badge, Box, Group, Text, Tooltip } from "@mantine/core";
import { IconInfoCircle, IconTrophy } from "@tabler/icons-react";
import type { WinnerMetrics } from "./types";

interface ComparisonResultsSectionProps {
  winnerMetrics: WinnerMetrics;
  rowCount: number;
}

export function ComparisonResultsSection({
  winnerMetrics,
  rowCount,
}: ComparisonResultsSectionProps) {
  const hasWinners =
    winnerMetrics.quality ||
    winnerMetrics.popularity ||
    winnerMetrics.maintenance ||
    winnerMetrics.weeklyDownloads ||
    winnerMetrics.stars ||
    winnerMetrics.forks ||
    winnerMetrics.dependentsCount;

  return (
    <Box
      px="lg"
      py="xs"
      style={{
        display: "grid",
        gridTemplateRows: "subgrid",
        gridRow: `span ${String(rowCount)}`,
        borderTop: "1px solid var(--mantine-color-default-border)",
      }}
    >
      {hasWinners ? (
        <Box>
          <Group gap="xs" mb="xs">
            <IconTrophy size={18} color="var(--mantine-color-orange-6)" />
            <Text size="sm" fw={600}>
              Comparison Results
            </Text>
            <Tooltip
              label="Metrics where this package leads compared to others"
              multiline
              w={250}
            >
              <IconInfoCircle
                size={14}
                color="var(--mantine-color-dimmed)"
                style={{ cursor: "help" }}
              />
            </Tooltip>
          </Group>
          <Group gap="xs" wrap="wrap">
            {winnerMetrics.weeklyDownloads && (
              <Badge size="sm" color="orange" variant="light">
                Most Downloads
              </Badge>
            )}
            {winnerMetrics.stars && (
              <Badge size="sm" color="orange" variant="light">
                Most Stars
              </Badge>
            )}
            {winnerMetrics.forks && (
              <Badge size="sm" color="orange" variant="light">
                Most Forks
              </Badge>
            )}
            {winnerMetrics.dependentsCount && (
              <Badge size="sm" color="orange" variant="light">
                Most Dependents
              </Badge>
            )}
            {winnerMetrics.quality && (
              <Badge size="sm" color="orange" variant="light">
                Highest Quality
              </Badge>
            )}
            {winnerMetrics.popularity && (
              <Badge size="sm" color="orange" variant="light">
                Most Popular
              </Badge>
            )}
            {winnerMetrics.maintenance && (
              <Badge size="sm" color="orange" variant="light">
                Best Maintained
              </Badge>
            )}
          </Group>
        </Box>
      ) : (
        <Box>
          <Text size="xs" c="dimmed">
            &nbsp;
          </Text>
        </Box>
      )}
    </Box>
  );
}
