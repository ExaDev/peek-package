import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Group,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { IconCode, IconExternalLink, IconX } from "@tabler/icons-react";
import type { PackageStats } from "@/types/adapter";

interface HeaderSectionProps {
  packageName: string;
  packageStats: PackageStats | null;
  isLoading: boolean;
  showRemove: boolean;
  onRemove: () => void;
}

export function HeaderSection({
  packageName,
  packageStats,
  isLoading,
  showRemove,
  onRemove,
}: HeaderSectionProps) {
  if (isLoading) {
    return (
      <Box
        py="sm"
        px="lg"
        bg="var(--mantine-primary-color-light)"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Skeleton height={24} width="60%" mb="xs" />
        <Skeleton height={16} width="100%" />
      </Box>
    );
  }

  const hasLinks = packageStats?.links;

  return (
    <Box
      py="sm"
      px="lg"
      bg="var(--mantine-primary-color-light)"
      style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
    >
      <Group justify="space-between" wrap="nowrap" mb="xs">
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

      {packageStats && (
        <Stack gap="xs">
          <Text size="sm" c="dimmed" lineClamp={2}>
            {packageStats.description || "No description available"}
          </Text>
          <Group gap="xs">
            <Badge variant="outline" size="sm">
              v{packageStats.version}
            </Badge>
            {packageStats.github?.language && (
              <Badge
                variant="light"
                size="sm"
                leftSection={<IconCode size={10} />}
              >
                {packageStats.github.language}
              </Badge>
            )}
          </Group>

          {hasLinks && (
            <Group gap="xs">
              {packageStats.links?.npm && (
                <Anchor href={packageStats.links.npm} target="_blank" size="xs">
                  <Group gap={2}>
                    npm <IconExternalLink size={10} />
                  </Group>
                </Anchor>
              )}
              {packageStats.links?.repository && (
                <Anchor
                  href={packageStats.links.repository}
                  target="_blank"
                  size="xs"
                >
                  <Group gap={2}>
                    Repository <IconExternalLink size={10} />
                  </Group>
                </Anchor>
              )}
              {packageStats.links?.homepage && (
                <Anchor
                  href={packageStats.links.homepage}
                  target="_blank"
                  size="xs"
                >
                  <Group gap={2}>
                    Homepage <IconExternalLink size={10} />
                  </Group>
                </Anchor>
              )}
            </Group>
          )}
        </Stack>
      )}
    </Box>
  );
}
