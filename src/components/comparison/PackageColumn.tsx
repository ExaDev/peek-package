import { Box, Paper, Title } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { PackageStats } from "@/types/adapter";
import { PackageAutocompleteInput } from "./PackageAutocompleteInput";
import { PackageMetricsPanel } from "./PackageMetricsPanel";
import type { PackageColumnState } from "@/hooks/usePackageColumn";

interface PackageColumnProps {
  columnState: PackageColumnState;
  index: number;
  packageStats: PackageStats | null;
  isLoading: boolean;
  showRemove: boolean;
  winnerMetrics?: {
    [key in keyof PackageStats]?: boolean;
  };
  onUpdate: (updates: Partial<PackageColumnState>) => void;
  onRemove: () => void;
}

export function PackageColumn({
  columnState,
  index,
  packageStats,
  isLoading,
  showRemove,
  winnerMetrics = {},
  onUpdate,
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
      {/* Autocomplete Input */}
      <PackageAutocompleteInput
        index={index}
        value={columnState.value}
        searchQuery={columnState.searchQuery}
        onChange={(newValue) => {
          // Update display value and search query as user types
          onUpdate({ value: newValue, searchQuery: newValue });
        }}
        onSubmit={(submittedValue) => {
          // Update submittedValue to trigger API fetch
          onUpdate({ value: submittedValue, submittedValue });
        }}
        onRemove={showRemove ? onRemove : undefined}
        showRemove={showRemove}
      />

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
