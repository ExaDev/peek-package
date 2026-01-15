import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Skeleton,
  Stack,
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
    <Group justify="space-between">
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

  if (isLoading) {
    return (
      <Box
        py="md"
        px="lg"
        style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
      >
        <Skeleton height={20} width="40%" mb="sm" />
        <Stack gap="xs">
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="80%" />
        </Stack>
      </Box>
    );
  }

  if (!packageStats) {
    return null;
  }

  const hasKeywords = (packageStats.npm?.keywords.length ?? 0) > 0;

  return (
    <Box
      py="md"
      px="lg"
      style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
    >
      <Group justify="space-between" mb="xs">
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
      <Stack gap="xs">
        <MetricRow
          label="Weekly Downloads"
          value={formatNumber(packageStats.weeklyDownloads)}
        />
        <MetricRow
          label="Dependents"
          value={formatNumber(packageStats.dependentsCount)}
        />
        <MetricRow label="License" value={packageStats.npm?.license ?? "N/A"} />
        <MetricRow
          label="Dependencies"
          value={String(packageStats.npm?.dependencies.length ?? 0)}
        />
        {(packageStats.npm?.devDependencies.length ?? 0) > 0 && (
          <MetricRow
            label="Dev Dependencies"
            value={String(packageStats.npm?.devDependencies.length ?? 0)}
          />
        )}
        {(packageStats.npm
          ? Object.keys(packageStats.npm.peerDependencies).length
          : 0) > 0 && (
          <MetricRow
            label="Peer Dependencies"
            value={String(
              packageStats.npm
                ? Object.keys(packageStats.npm.peerDependencies).length
                : 0,
            )}
          />
        )}

        {/* Keywords */}
        {hasKeywords && (
          <Box>
            <Text size="xs" c="dimmed" mb={4}>
              Keywords
            </Text>
            <Group gap={4}>
              {packageStats.npm?.keywords.slice(0, 5).map((kw) => (
                <Badge key={kw} size="xs" variant="outline">
                  {kw}
                </Badge>
              ))}
              {(packageStats.npm?.keywords.length ?? 0) > 5 && (
                <Badge size="xs" variant="light">
                  +{String((packageStats.npm?.keywords.length ?? 0) - 5)} more
                </Badge>
              )}
            </Group>
          </Box>
        )}

        {/* Author */}
        {packageStats.author && (
          <MetricRow label="Author" value={packageStats.author.name} />
        )}

        {/* Maintainers */}
        {packageStats.maintainers && packageStats.maintainers.length > 0 && (
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">
                Maintainers ({packageStats.maintainers.length})
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
                {packageStats.maintainers.map((m) => (
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
        )}
      </Stack>
    </Box>
  );
}
