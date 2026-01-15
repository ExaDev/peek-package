import type { HistoryEntry } from "@/hooks/useComparisonHistory";
import { Menu, Text, Group, Button } from "@mantine/core";
import { IconHistory, IconClock, IconTrash } from "@tabler/icons-react";

interface HistoryPanelProps {
  history: HistoryEntry[];
  formatRelativeTime: (timestamp: number) => string;
  onLoadComparison: (packages: string[]) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({
  history,
  formatRelativeTime,
  onLoadComparison,
  onClearHistory,
}: HistoryPanelProps) {
  return (
    <Menu shadow="md" width={300} position="bottom-end">
      <Menu.Target>
        <Button
          variant="light"
          color="brand"
          size="sm"
          leftSection={<IconHistory size={16} />}
        >
          History
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Recent Comparisons</Menu.Label>
        {history.length === 0 ? (
          <Menu.Item disabled>
            <Text size="sm" c="dimmed">
              No recent comparisons
            </Text>
          </Menu.Item>
        ) : (
          history.map((entry, index) => (
            <Menu.Item
              key={`${entry.packages.join("-")}-${String(index)}`}
              onClick={() => {
                onLoadComparison(entry.packages);
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Text
                  size="sm"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.packages.join(" vs ")}
                </Text>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  <Group gap={4} wrap="nowrap">
                    <IconClock size={12} />
                    {formatRelativeTime(entry.timestamp)}
                  </Group>
                </Text>
              </Group>
            </Menu.Item>
          ))
        )}

        {history.length > 0 && (
          <>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={onClearHistory}
            >
              Clear History
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
