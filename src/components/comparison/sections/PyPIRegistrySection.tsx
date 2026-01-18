import { Badge, Box, Group, Skeleton, Text, Tooltip } from "@mantine/core";
import {
  IconBrandPython,
} from "@tabler/icons-react";
import type { PackageStats } from "@/types/adapter";

interface PyPIRegistrySectionProps {
  packageStats: PackageStats | null;
  isLoading: boolean;
  rowCount: number;
}

function formatRelativeDate(dateStr: string | undefined): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${String(diffDays)} days ago`;
  if (diffDays < 30) return `${String(Math.floor(diffDays / 7))} weeks ago`;
  if (diffDays < 365) return `${String(Math.floor(diffDays / 30))} months ago`;
  return `${String(Math.floor(diffDays / 365))} years ago`;
}

function MetricRow({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string | number;
  tooltip?: string;
}) {
  const content = (
    <Group justify="space-between" px="lg" py="xs">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </Group>
  );

  if (tooltip) {
    return (
      <Tooltip label={tooltip}>
        {content}
      </Tooltip>
    );
  }

  return content;
}

export function PyPIRegistrySection({
  packageStats,
  isLoading,
  rowCount,
}: PyPIRegistrySectionProps) {
  const px = "lg";
  const py = "xs";

  if (isLoading) {
    return (
      <Box
        style={{
          display: "grid",
          gridTemplateRows: "subgrid",
          gridRow: `span ${String(rowCount)}`,
          borderTop: "1px solid var(--mantine-color-default-border)",
        }}
      >
        {Array.from({ length: rowCount }).map((_, i) => (
          <Box key={i} px={px} py={py}>
            <Skeleton height={16} width={i === 0 ? "40%" : "100%"} />
          </Box>
        ))}
      </Box>
    );
  }

  const pypiStats = packageStats?.pypi;
  const hasClassifiers = (pypiStats?.classifiers.length ?? 0) > 0;

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateRows: "subgrid",
        gridRow: `span ${String(rowCount)}`,
        borderTop: "1px solid var(--mantine-color-default-border)",
      }}
    >
      {/* Row 1: Section title */}
      <Group justify="space-between" px={px} py={py}>
        <Group gap="xs">
          <IconBrandPython size={18} color="var(--mantine-color-blue-6)" />
          <Text size="sm" fw={600}>
            PyPI Registry
          </Text>
        </Group>
      </Group>

      {/* Row 2: Requires Python */}
      <MetricRow
        label="Requires Python"
        value={pypiStats?.requiresPython ?? "Any"}
      />

      {/* Row 3: License */}
      <MetricRow
        label="License"
        value={pypiStats?.license ?? "Not specified"}
      />

      {/* Row 4: Dependencies */}
      <MetricRow
        label="Dependencies"
        value={String(pypiStats?.dependencies.length ?? 0)}
      />

      {/* Row 5: Total Uploads */}
      <MetricRow
        label="Total Uploads"
        value={String(pypiStats?.uploads ?? 0)}
      />

      {/* Row 6: Last Upload */}
      {pypiStats?.upload_time && (
        <Group justify="space-between" px={px} py={py}>
          <Text size="xs" c="dimmed">
            Last Upload
          </Text>
          <Text size="sm">
            {formatRelativeDate(pypiStats.upload_time)}
          </Text>
        </Group>
      )}

      {/* Row 7: Author */}
      {packageStats?.author && (
        <MetricRow
          label="Author"
          value={packageStats.author.name}
        />
      )}

      {/* Row 8: Classifiers */}
      {hasClassifiers && (
        <Box px={px} py={py}>
          <Group gap={4}>
            {pypiStats?.classifiers.slice(0, 5).map((c) => (
              <Badge key={c} size="xs" variant="outline">
                {c.replace(/^[^:]+::\s*/, "")}
              </Badge>
            ))}
            {(pypiStats?.classifiers.length ?? 0) > 5 && (
              <Badge size="xs" variant="light">
                +{String((pypiStats?.classifiers.length ?? 0) - 5)} more
              </Badge>
            )}
          </Group>
        </Box>
      )}
    </Box>
  );
}
