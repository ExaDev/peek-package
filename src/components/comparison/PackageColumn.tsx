import { ActionIcon, Card, Divider, Group, Text, Title } from "@mantine/core";
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
  // Separate npm and GitHub refresh callbacks
  onRefreshNpm?: () => void;
  onRefreshGithub?: () => void;
  isRefetchingNpm?: boolean;
  isRefetchingGithub?: boolean;
}

export function PackageColumn({
  packageName,
  packageStats,
  isLoading,
  showRemove,
  winnerMetrics = {},
  onRemove,
  onRefreshNpm,
  onRefreshGithub,
  isRefetchingNpm = false,
  isRefetchingGithub = false,
}: PackageColumnProps) {
  return (
    <Card shadow="sm" padding={0} withBorder style={{ height: "100%" }}>
      {/* Column Header */}
      <Card.Section
        inheritPadding
        py="sm"
        px="lg"
        bg="var(--mantine-color-brand-0)"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} size="lg">
            {packageName}
          </Text>
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
      </Card.Section>

      {/* Metrics Panel */}
      <Card.Section inheritPadding py="md" px="lg">
        <PackageMetricsPanel
          packageStats={packageStats}
          isLoading={isLoading}
          winnerMetrics={winnerMetrics}
          onRefreshNpm={onRefreshNpm}
          onRefreshGithub={onRefreshGithub}
          isRefetchingNpm={isRefetchingNpm}
          isRefetchingGithub={isRefetchingGithub}
        />
      </Card.Section>

      {/* README Section */}
      {packageStats?.github?.readme && (
        <Card.Section inheritPadding py="md" px="lg">
          <Divider mb="md" />
          <Title order={5} mb="md">
            README
          </Title>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {packageStats.github.readme}
          </ReactMarkdown>
        </Card.Section>
      )}
    </Card>
  );
}
