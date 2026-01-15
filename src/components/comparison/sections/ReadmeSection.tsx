import { Box, Text, Title } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { PackageStats } from "@/types/adapter";

interface ReadmeSectionProps {
  packageStats: PackageStats | null;
  rowCount: number;
}

export function ReadmeSection({ packageStats, rowCount }: ReadmeSectionProps) {
  return (
    <Box
      px="lg"
      py="md"
      style={{
        display: "grid",
        gridTemplateRows: "subgrid",
        gridRow: `span ${String(rowCount)}`,
        borderTop: "1px solid var(--mantine-color-default-border)",
      }}
    >
      {packageStats?.github?.readme ? (
        <Box>
          <Title order={5} mb="md">
            README
          </Title>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {packageStats.github.readme}
          </ReactMarkdown>
        </Box>
      ) : (
        <Box>
          <Text size="sm" c="dimmed">
            No README available
          </Text>
        </Box>
      )}
    </Box>
  );
}
