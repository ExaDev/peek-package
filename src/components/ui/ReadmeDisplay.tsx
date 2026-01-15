import { Paper, Text, Title } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface ReadmeDisplayProps {
  packageName: string;
  readme: string | null;
}

export function ReadmeDisplay({ packageName, readme }: ReadmeDisplayProps) {
  if (!readme) {
    return (
      <Text c="dimmed">No README available for {packageName}</Text>
    );
  }

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={3} mb="md">
        {packageName} README
      </Title>
      <div style={{ maxHeight: '600px', overflow: 'auto' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {readme}
        </ReactMarkdown>
      </div>
    </Paper>
  );
}
