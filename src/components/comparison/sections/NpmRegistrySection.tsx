import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Skeleton,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBrandNpm,
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
} from "@tabler/icons-react";
import type { PackageStats } from "@/types/adapter";
import { getGravatarUrl } from "@/utils/gravatar";

interface NpmRegistrySectionProps {
  packageStats: PackageStats | null;
  isLoading: boolean;
  isRefetchingNpm?: boolean;
  onRefreshNpm?: () => void;
  rowCount: number;
}

function formatNumber(value: number | undefined): string {
  if (value === undefined) return "N/A";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Group justify="space-between" px="lg" py="xs">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </Group>
  );
}

export function NpmRegistrySection({
  packageStats,
  isLoading,
  isRefetchingNpm = false,
  onRefreshNpm,
  rowCount,
}: NpmRegistrySectionProps) {
  const [maintainersExpanded, setMaintainersExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const maintainersRef = useRef<HTMLDivElement>(null);

  const maintainersCount = packageStats?.maintainers?.length ?? 0;
  useEffect(() => {
    const checkOverflow = () => {
      const el = maintainersRef.current;
      if (el) {
        const originalMaxHeight = el.style.maxHeight;
        el.style.maxHeight = "none";
        const contentHeight = el.scrollHeight;
        el.style.maxHeight = originalMaxHeight;
        setHasOverflow(contentHeight > 33);
      }
    };
    const frameId = requestAnimationFrame(checkOverflow);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [maintainersCount]);

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

  const hasKeywords = (packageStats?.npm?.keywords.length ?? 0) > 0;

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
          <IconBrandNpm size={18} color="var(--mantine-color-red-6)" />
          <Text size="sm" fw={600}>
            npm Registry
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

      {/* Row 2: Weekly Downloads */}
      <MetricRow
        label="Weekly Downloads"
        value={formatNumber(packageStats?.weeklyDownloads)}
      />

      {/* Row 3: Dependents */}
      <MetricRow
        label="Dependents"
        value={formatNumber(packageStats?.dependentsCount)}
      />

      {/* Row 4: License */}
      <MetricRow label="License" value={packageStats?.npm?.license ?? "N/A"} />

      {/* Row 5: Dependencies */}
      <MetricRow
        label="Dependencies"
        value={String(packageStats?.npm?.dependencies.length ?? 0)}
      />

      {/* Row 6: Dev Dependencies */}
      <MetricRow
        label="Dev Dependencies"
        value={String(packageStats?.npm?.devDependencies.length ?? 0)}
      />

      {/* Row 7: Peer Dependencies */}
      <MetricRow
        label="Peer Dependencies"
        value={String(
          packageStats?.npm
            ? Object.keys(packageStats.npm.peerDependencies).length
            : 0,
        )}
      />

      {/* Row 8: Keywords */}
      <Box px={px} py={py}>
        {hasKeywords ? (
          <Group gap={4}>
            {packageStats?.npm?.keywords.slice(0, 5).map((kw) => (
              <Badge key={kw} size="xs" variant="outline">
                {kw}
              </Badge>
            ))}
            {(packageStats?.npm?.keywords.length ?? 0) > 5 && (
              <Badge size="xs" variant="light">
                +{String((packageStats?.npm?.keywords.length ?? 0) - 5)} more
              </Badge>
            )}
          </Group>
        ) : (
          <Text size="xs" c="dimmed">
            No keywords
          </Text>
        )}
      </Box>

      {/* Row 9: Author */}
      <MetricRow label="Author" value={packageStats?.author?.name ?? "N/A"} />

      {/* Row 10: Maintainers */}
      <Box px={px} py={py}>
        <Group justify="space-between" mb={4}>
          <Text size="xs" c="dimmed">
            Maintainers ({packageStats?.maintainers?.length ?? 0})
          </Text>
          {(hasOverflow || maintainersExpanded) && (
            <UnstyledButton
              onClick={() => {
                setMaintainersExpanded(!maintainersExpanded);
              }}
            >
              <Group gap={2}>
                <Text size="xs" c="blue">
                  {maintainersExpanded ? "Show less" : "Show all"}
                </Text>
                {maintainersExpanded ? (
                  <IconChevronUp
                    size={14}
                    color="var(--mantine-color-blue-6)"
                  />
                ) : (
                  <IconChevronDown
                    size={14}
                    color="var(--mantine-color-blue-6)"
                  />
                )}
              </Group>
            </UnstyledButton>
          )}
        </Group>
        <Box
          ref={maintainersRef}
          style={{
            overflow: "hidden",
            maxHeight: maintainersExpanded ? "500px" : "32px",
            transition: "max-height 200ms ease-in-out",
          }}
        >
          <Group gap="xs" wrap="wrap">
            {packageStats?.maintainers?.map((m) => (
              <Tooltip key={m.name} label={m.name}>
                <Avatar
                  src={getGravatarUrl(m.email, 32)}
                  size="sm"
                  radius="xl"
                  alt={m.name}
                />
              </Tooltip>
            ))}
          </Group>
        </Box>
      </Box>
    </Box>
  );
}
