import { Box, Title } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { PackageStats } from "@/types/adapter";

interface ReadmeSectionProps {
  packageStats: PackageStats | null;
}

export function ReadmeSection({ packageStats }: ReadmeSectionProps) {
  if (!packageStats?.github?.readme) {
    return null;
  }

  return (
    <Box
      py="md"
      px="lg"
      style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
    >
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
  );
}
