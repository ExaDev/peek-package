import {
  Badge,
  Box,
  Group,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCalculator, IconInfoCircle } from "@tabler/icons-react";
import type { PackageStats } from "@/types/adapter";

interface NpmsScoresSectionProps {
  packageStats: PackageStats | null;
  isLoading: boolean;
}

function getScoreColor(score: number | undefined): "green" | "yellow" | "red" {
  if (score === undefined) return "red";
  if (score > 80) return "green";
  if (score > 60) return "yellow";
  return "red";
}

const CALCULATION_TOOLTIPS = {
  finalScore:
    "Weighted combination of Quality (30%), Popularity (35%), and Maintenance (35%) scores",
  quality:
    "Based on: test coverage detection, code health indicators, linting/TypeScript usage, README quality and description",
  popularity:
    "Based on: community interest (stars + forks), download volume, download growth rate, packages depending on this",
  maintenance:
    "Based on: release frequency, commit frequency, issue response time, issue resolution distribution",
  tests: "Detects presence of test frameworks and test files in the repository",
  health:
    "Checks for .npmignore, lockfiles, shrinkwrap, and other health indicators",
  carefulness: "Checks for linting setup, TypeScript, and code quality tooling",
  branding:
    "Evaluates README presence, quality, and package description completeness",
  releasesFrequency: "How frequently new versions are published to npm",
  commitsFrequency: "How frequently commits are made to the repository",
  openIssues: "Score based on how quickly issues receive responses",
  issuesDistribution: "Score based on issue resolution time distribution",
};

function MetricRow({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip?: string;
}) {
  return (
    <Group justify="space-between">
      <Group gap={4}>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        {tooltip && (
          <Tooltip label={tooltip} multiline w={250}>
            <IconInfoCircle
              size={12}
              color="var(--mantine-color-dimmed)"
              style={{ cursor: "help" }}
            />
          </Tooltip>
        )}
      </Group>
      <Badge size="xs" variant="light">
        {value}
      </Badge>
    </Group>
  );
}

export function NpmsScoresSection({
  packageStats,
  isLoading,
}: NpmsScoresSectionProps) {
  if (isLoading) {
    return (
      <Box py="md" px="lg">
        <Skeleton height={20} width="40%" mb="sm" />
        <Stack gap="xs">
          <Skeleton height={24} width="100%" />
          <Skeleton height={20} width="80%" />
        </Stack>
      </Box>
    );
  }

  if (!packageStats) {
    return null;
  }

  const hasEvaluation = packageStats.evaluation;

  return (
    <Box py="md" px="lg">
      <Group gap="xs" mb="xs">
        <IconCalculator size={18} color="var(--mantine-color-violet-6)" />
        <Text size="sm" fw={600}>
          npms.io Scores
        </Text>
        <Tooltip
          label="Normalized 0-100 scores calculated by npms.io. These enable comparison across packages."
          multiline
          w={280}
        >
          <IconInfoCircle
            size={14}
            color="var(--mantine-color-dimmed)"
            style={{ cursor: "help" }}
          />
        </Tooltip>
      </Group>

      <Stack gap="md">
        {/* Overall Score */}
        <Group justify="space-between">
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              Overall Score
            </Text>
            <Tooltip label={CALCULATION_TOOLTIPS.finalScore} multiline w={250}>
              <IconInfoCircle
                size={12}
                color="var(--mantine-color-dimmed)"
                style={{ cursor: "help" }}
              />
            </Tooltip>
          </Group>
          <Badge
            color={getScoreColor(packageStats.finalScore)}
            variant="filled"
            size="lg"
          >
            {packageStats.finalScore ?? "N/A"}/100
          </Badge>
        </Group>

        {/* Main Score Badges */}
        <Group gap="xs" wrap="wrap">
          <Tooltip label={CALCULATION_TOOLTIPS.quality} multiline w={250}>
            <Badge
              size="sm"
              color={getScoreColor(packageStats.quality)}
              style={{ cursor: "help" }}
            >
              Quality: {packageStats.quality ?? "N/A"}
            </Badge>
          </Tooltip>

          <Tooltip label={CALCULATION_TOOLTIPS.popularity} multiline w={250}>
            <Badge
              size="sm"
              color={getScoreColor(packageStats.popularity)}
              style={{ cursor: "help" }}
            >
              Popularity: {packageStats.popularity ?? "N/A"}
            </Badge>
          </Tooltip>

          <Tooltip label={CALCULATION_TOOLTIPS.maintenance} multiline w={250}>
            <Badge
              size="sm"
              color={getScoreColor(packageStats.maintenance)}
              style={{ cursor: "help" }}
            >
              Maintenance: {packageStats.maintenance ?? "N/A"}
            </Badge>
          </Tooltip>
        </Group>

        {/* Detailed Breakdowns */}
        {hasEvaluation && (
          <Stack gap="md">
            {/* Quality Breakdown */}
            {packageStats.evaluation?.quality && (
              <Box>
                <Text size="xs" fw={500} mb={4}>
                  Quality Breakdown
                </Text>
                <Stack gap={2}>
                  <MetricRow
                    label="Tests"
                    value={`${String(packageStats.evaluation.quality.tests)}%`}
                    tooltip={CALCULATION_TOOLTIPS.tests}
                  />
                  <MetricRow
                    label="Health"
                    value={`${String(packageStats.evaluation.quality.health)}%`}
                    tooltip={CALCULATION_TOOLTIPS.health}
                  />
                  <MetricRow
                    label="Carefulness"
                    value={`${String(packageStats.evaluation.quality.carefulness)}%`}
                    tooltip={CALCULATION_TOOLTIPS.carefulness}
                  />
                  <MetricRow
                    label="Branding"
                    value={`${String(packageStats.evaluation.quality.branding)}%`}
                    tooltip={CALCULATION_TOOLTIPS.branding}
                  />
                </Stack>
              </Box>
            )}

            {/* Maintenance Breakdown */}
            {packageStats.evaluation?.maintenance && (
              <Box>
                <Text size="xs" fw={500} mb={4}>
                  Maintenance Breakdown
                </Text>
                <Stack gap={2}>
                  <MetricRow
                    label="Release Frequency"
                    value={`${String(packageStats.evaluation.maintenance.releasesFrequency)}%`}
                    tooltip={CALCULATION_TOOLTIPS.releasesFrequency}
                  />
                  <MetricRow
                    label="Commit Frequency"
                    value={`${String(packageStats.evaluation.maintenance.commitsFrequency)}%`}
                    tooltip={CALCULATION_TOOLTIPS.commitsFrequency}
                  />
                  <MetricRow
                    label="Open Issues"
                    value={`${String(packageStats.evaluation.maintenance.openIssues)}%`}
                    tooltip={CALCULATION_TOOLTIPS.openIssues}
                  />
                  <MetricRow
                    label="Issues Distribution"
                    value={`${String(packageStats.evaluation.maintenance.issuesDistribution)}%`}
                    tooltip={CALCULATION_TOOLTIPS.issuesDistribution}
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
