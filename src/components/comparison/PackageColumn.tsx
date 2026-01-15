import { ActionIcon, Box, Group, Paper, Title } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { PackageStats } from "@/types/adapter";
import { PackageMetricsPanel } from "./PackageMetricsPanel";

interface PackageColumnProps {
  packageName: string;
  packageStats: PackageStats | null;
  isLoading: boolean;
  showRemove: boolean;
  winnerMetrics?: {
    [key in keyof PackageStats]?: boolean;
  };
  onRemove: () => void;
}

export function PackageColumn({
  packageName,
  packageStats,
  isLoading,
  showRemove,
  winnerMetrics = {},
  onRemove,
}: PackageColumnProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
      }}
    >
      {/* Package Header with Remove Button */}
      <Paper p="sm" radius="md" withBorder>
        <Group justify="space-between" wrap="nowrap">
          <Title order={4}>{packageName}</Title>
          {showRemove && (
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={onRemove}
              size="sm"
              aria-label={`Remove ${packageName}`}
            >
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
      </Paper>

      {/* Metrics Panel */}
      <PackageMetricsPanel
        packageStats={packageStats}
        isLoading={isLoading}
        winnerMetrics={winnerMetrics}
      />

      {/* README Section */}
      {packageStats?.github?.readme && (
        <Paper p="md" radius="md" withBorder>
          <Title order={5} mb="md">
            README
          </Title>
          <Box
            style={{
              maxHeight: "500px",
              overflow: "auto",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {packageStats.github.readme}
            </ReactMarkdown>
          </Box>
        </Paper>
      )}
    </div>
  );
}
