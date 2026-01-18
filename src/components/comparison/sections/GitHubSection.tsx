import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Box,
  Group,
  Skeleton,
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
  rowCount: number;
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
  tooltip,
}: {
  label: string;
  value: string | number;
  tooltip?: string;
}) {
  return (
    <Group justify="space-between" px="lg" py="xs">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      {tooltip ? (
        <Tooltip label={tooltip}>
          <Text size="sm">{value}</Text>
        </Tooltip>
      ) : (
        <Text size="sm">{value}</Text>
      )}
    </Group>
  );
}

export function GitHubSection({
  packageStats,
  isLoading,
  isRefetchingGithub = false,
  onRefreshGithub,
  rowCount,
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

  // Check for GitHub API error
  const hasError = packageStats?.github?.error;
  const errorMessage = packageStats?.github?.errorMessage;

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

      {/* If there's an error, show error message instead of metrics */}
      {hasError ? (
        <>
          <Box px={px} py={py}>
            <Text size="sm" c="red">
              {errorMessage}
            </Text>
          </Box>
          {/* Fill remaining rows with empty boxes to maintain grid structure */}
          {Array.from({ length: rowCount - 2 }).map((_, i) => (
            <Box key={i} px={px} py={py} />
          ))}
        </>
      ) : (
        <>
          {/* Row 2: Stars */}
          <MetricRow label="Stars" value={formatNumber(packageStats?.stars)} />

          {/* Row 3: Forks */}
          <MetricRow label="Forks" value={formatNumber(packageStats?.forks)} />

          {/* Row 4: Open Issues */}
          <MetricRow
            label="Open Issues"
            value={formatNumber(packageStats?.openIssues)}
          />

          {/* Row 5: Watchers */}
          <MetricRow
            label="Watchers"
            value={formatNumber(packageStats?.github?.subscribers)}
          />

          {/* Row 6: Last Push */}
          <MetricRow
            label="Last Push"
            value={formatRelativeDate(packageStats?.github?.pushedAt)}
            tooltip={formatDate(packageStats?.github?.pushedAt)}
          />

          {/* Row 7: Created */}
          <MetricRow
            label="Created"
            value={formatDate(packageStats?.github?.createdAt)}
          />

          {/* Row 8: Last Updated */}
          <MetricRow
            label="Last Updated"
            value={formatRelativeDate(packageStats?.github?.updatedAt)}
            tooltip={formatDate(packageStats?.github?.updatedAt)}
          />

          {/* Row 9: Repo Size */}
          <MetricRow
            label="Repo Size"
            value={formatSize(packageStats?.github?.size)}
          />

          {/* Row 10: Default Branch */}
          <MetricRow
            label="Default Branch"
            value={packageStats?.github?.defaultBranch ?? "N/A"}
          />

          {/* Row 11: Contributors */}
          <Box px={px} py={py}>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">
                Top Contributors (
                {String(packageStats?.contributors?.length ?? 0)})
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
                {packageStats?.contributors?.map((c) => (
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
        </>
      )}
    </Box>
  );
}
