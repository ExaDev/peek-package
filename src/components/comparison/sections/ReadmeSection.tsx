import type { Components } from "react-markdown";
import { Box, Text, Title } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { PackageStats } from "@/types/adapter";
import classes from "./ReadmeSection.module.css";

interface ReadmeSectionProps {
  packageStats: PackageStats | null;
  rowCount: number;
}

// Custom components to style markdown elements
const markdownComponents: Components = {
  img: ({ src, alt, ...props }) => (
    <img
      src={src}
      alt={alt ?? ""}
      {...props}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  ),
};

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
        overflow: "hidden",
      }}
    >
      {packageStats?.github?.readme ? (
        <Box className={classes.readmeContent}>
          <Title order={5} mb="md">
            README
          </Title>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={markdownComponents}
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
