import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Box,
  Group,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBrandGithub,
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
} from "@tabler/icons-react";
import type { PackageStats } from "@/types/adapter";

interface GitHubSectionProps {
  packageStats: PackageStats | null;
  isLoading: boolean;
  isRefetchingGithub?: boolean;
  onRefreshGithub?: () => void;
}

function formatNumber(value: number | undefined): string {
  if (value === undefined) return "N/A";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function formatSize(sizeKb: number | undefined): string {
  if (sizeKb === undefined) return "N/A";
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${String(sizeKb)} KB`;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export function GitHubSection({
  packageStats,
  isLoading,
  isRefetchingGithub = false,
  onRefreshGithub,
}: GitHubSectionProps) {
  const [contributorsExpanded, setContributorsExpanded] = useState(false);
  const [hasContributorOverflow, setHasContributorOverflow] = useState(false);
  const contributorsRef = useRef<HTMLDivElement>(null);

  const contributorsCount = packageStats?.contributors?.length ?? 0;
  useEffect(() => {
    const checkOverflow = () => {
      const el = contributorsRef.current;
      if (el) {
        const originalMaxHeight = el.style.maxHeight;
        el.style.maxHeight = "none";
        const contentHeight = el.scrollHeight;
        el.style.maxHeight = originalMaxHeight;
        setHasContributorOverflow(contentHeight > 33);
      }
    };
    const frameId = requestAnimationFrame(checkOverflow);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [contributorsCount]);

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

  return (
    <Box
      py="md"
      px="lg"
      style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
    >
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
        <MetricRow label="Stars" value={formatNumber(packageStats.stars)} />
        <MetricRow label="Forks" value={formatNumber(packageStats.forks)} />
        <MetricRow
          label="Open Issues"
          value={formatNumber(packageStats.openIssues)}
        />
        {packageStats.github && (
          <MetricRow
            label="Watchers"
            value={formatNumber(packageStats.github.subscribers)}
          />
        )}
        {packageStats.github?.pushedAt && (
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Last Push
            </Text>
            <Tooltip label={formatDate(packageStats.github.pushedAt)}>
              <Text size="sm">
                {formatRelativeDate(packageStats.github.pushedAt)}
              </Text>
            </Tooltip>
          </Group>
        )}
        {packageStats.github?.createdAt && (
          <MetricRow
            label="Created"
            value={formatDate(packageStats.github.createdAt)}
          />
        )}
        {packageStats.github?.updatedAt && (
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Last Updated
            </Text>
            <Tooltip label={formatDate(packageStats.github.updatedAt)}>
              <Text size="sm">
                {formatRelativeDate(packageStats.github.updatedAt)}
              </Text>
            </Tooltip>
          </Group>
        )}
        {packageStats.github?.size !== undefined &&
          packageStats.github.size > 0 && (
            <MetricRow
              label="Repo Size"
              value={formatSize(packageStats.github.size)}
            />
          )}
        {packageStats.github?.defaultBranch && (
          <MetricRow
            label="Default Branch"
            value={packageStats.github.defaultBranch}
          />
        )}

        {/* Contributors */}
        {packageStats.contributors && packageStats.contributors.length > 0 && (
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">
                Top Contributors ({String(packageStats.contributors.length)})
              </Text>
              {(hasContributorOverflow || contributorsExpanded) && (
                <UnstyledButton
                  onClick={() => {
                    setContributorsExpanded(!contributorsExpanded);
                  }}
                >
                  <Group gap={2}>
                    <Text size="xs" c="blue">
                      {contributorsExpanded ? "Show less" : "Show all"}
                    </Text>
                    {contributorsExpanded ? (
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
              ref={contributorsRef}
              style={{
                overflow: "hidden",
                maxHeight: contributorsExpanded ? "500px" : "32px",
                transition: "max-height 200ms ease-in-out",
              }}
            >
              <Group gap="xs" wrap="wrap">
                {packageStats.contributors.map((c) => (
                  <Tooltip
                    key={c.username}
                    label={`${c.username} (${String(c.commitsCount)} commits)`}
                  >
                    <Anchor
                      href={`https://github.com/${c.username}`}
                      target="_blank"
                    >
                      <Avatar
                        src={`https://github.com/${c.username}.png?size=32`}
                        size="sm"
                        radius="xl"
                        alt={c.username}
                      />
                    </Anchor>
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
