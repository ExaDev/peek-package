import { Accordion, Text, Title } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { PackageStats } from '@/types/adapter';

interface ReadmeAccordionProps {
  packages: PackageStats[];
}

export function ReadmeAccordion({ packages }: ReadmeAccordionProps) {
  const packagesWithReadme = packages.filter((pkg) => pkg.github?.readme);

  if (packagesWithReadme.length === 0) {
    return (
      <Text c="dimmed">No READMEs available for any of the packages</Text>
    );
  }

  return (
    <Accordion
      defaultValue={packagesWithReadme[0]?.name}
      variant="filled"
      radius="md"
    >
      {packagesWithReadme.map((pkg) => (
        <Accordion.Item key={pkg.name} value={pkg.name}>
          <Accordion.Control>
            <Title order={4}>{pkg.name} README</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {pkg.github!.readme!}
              </ReactMarkdown>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
