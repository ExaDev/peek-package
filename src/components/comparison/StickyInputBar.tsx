import { useState, useEffect } from "react";
import {
  ActionIcon,
  Autocomplete,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Paper,
  Title,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCheck,
  IconLayoutColumns,
  IconLayoutGrid,
  IconLayoutList,
  IconMenu2,
  IconPlus,
  IconTable,
  IconTrash,
} from "@tabler/icons-react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePackageSearch } from "@/hooks/usePackageSearch";
import type { ViewMode } from "@/types/views";

const MOBILE_BREAKPOINT = 768;

const DEBOUNCE_DELAY = 300;

interface StickyInputBarProps {
  packages: string[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onClear: () => void;
  onAddPackage: (name: string) => void;
}

export function StickyInputBar({
  packages,
  viewMode,
  onViewModeChange,
  onClear,
  onAddPackage,
}: StickyInputBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const isMobile = useMediaQuery(`(max-width: ${String(MOBILE_BREAKPOINT)}px)`);

  // Debounce the search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(inputValue, DEBOUNCE_DELAY);

  // Fetch search suggestions using the debounced query
  const { data: searchResults, isLoading } =
    usePackageSearch(debouncedSearchQuery);

  // Format search results for Autocomplete component
  const suggestions = (searchResults || []).slice(0, 8).map((result) => ({
    value: result.package.name,
    label: result.package.name,
    description: truncate(result.package.description, 60),
  }));

  useEffect(() => {
    const handler = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handler);
    return () => {
      window.removeEventListener("scroll", handler);
    };
  }, []);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAddPackage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleOptionSubmit = (selectedValue: string) => {
    onAddPackage(selectedValue);
    // Use setTimeout to clear after Mantine's internal onChange fires
    setTimeout(() => {
      setInputValue("");
    }, 0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <Paper
      shadow={isScrolled ? "md" : "none"}
      px={isMobile ? "xs" : "md"}
      py="xs"
      bg="var(--mantine-primary-color-light)"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: isScrolled
          ? "1px solid var(--mantine-color-default-border)"
          : "none",
        transition: "all 0.2s",
      }}
    >
      <Box px={isMobile ? "xs" : "md"}>
        <Group
          justify="space-between"
          wrap="nowrap"
          gap={isMobile ? "xs" : "md"}
        >
          <Group
            gap={isMobile ? "xs" : "md"}
            wrap="nowrap"
            style={{ flex: 1, minWidth: 0 }}
          >
            {/* Hide title on mobile to save space */}
            {!isMobile && (
              <Title order={4} style={{ whiteSpace: "nowrap" }}>
                PeekPackage
              </Title>
            )}

            {/* Search input */}
            <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <Autocomplete
                placeholder={isMobile ? "Search..." : "Search packages..."}
                value={inputValue}
                onChange={setInputValue}
                onOptionSubmit={handleOptionSubmit}
                onKeyDown={handleKeyDown}
                data={suggestions}
                limit={8}
                style={{ flex: 1, minWidth: isMobile ? 100 : 200 }}
                rightSection={isLoading ? <div style={{ width: 16 }} /> : null}
                renderOption={({ option }) => {
                  const description = (option as { description?: string })
                    .description;
                  return (
                    <div>
                      <div style={{ fontWeight: 500 }}>{option.value}</div>
                      {typeof description === "string" && (
                        <div style={{ fontSize: "0.85em", opacity: 0.7 }}>
                          {description}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Tooltip label="Add package to comparison">
                <ActionIcon
                  color="brand"
                  variant="filled"
                  size={isMobile ? "md" : "lg"}
                  onClick={handleAdd}
                  disabled={!inputValue.trim()}
                  aria-label="Add package"
                >
                  <IconPlus size={isMobile ? 18 : 20} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {/* Package badges - hide on mobile */}
            {!isMobile && packages.length > 0 && (
              <Group gap={4} wrap="wrap">
                {packages.map((pkg, index) => (
                  <Badge
                    key={`${pkg}-${String(index)}`}
                    variant="light"
                    color="brand"
                  >
                    {pkg}
                  </Badge>
                ))}
              </Group>
            )}
          </Group>

          {/* Controls - hamburger menu on mobile, inline on desktop */}
          {packages.length > 0 &&
            (isMobile ? (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="brand" size="md">
                    <IconMenu2 size={20} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>View Mode</Menu.Label>
                  <Menu.Item
                    leftSection={<IconLayoutColumns size={16} />}
                    rightSection={
                      viewMode === "carousel" ? <IconCheck size={14} /> : null
                    }
                    onClick={() => {
                      onViewModeChange("carousel");
                    }}
                  >
                    Carousel
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconLayoutGrid size={16} />}
                    rightSection={
                      viewMode === "grid" ? <IconCheck size={14} /> : null
                    }
                    onClick={() => {
                      onViewModeChange("grid");
                    }}
                  >
                    Grid
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconLayoutList size={16} />}
                    rightSection={
                      viewMode === "list" ? <IconCheck size={14} /> : null
                    }
                    onClick={() => {
                      onViewModeChange("list");
                    }}
                  >
                    List
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconTable size={16} />}
                    rightSection={
                      viewMode === "table" ? <IconCheck size={14} /> : null
                    }
                    onClick={() => {
                      onViewModeChange("table");
                    }}
                  >
                    Table
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={onClear}
                  >
                    Clear All
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs" wrap="nowrap">
                {/* View mode selector */}
                <Group gap={4} wrap="nowrap">
                  <Tooltip label="Carousel view">
                    <ActionIcon
                      variant={viewMode === "carousel" ? "filled" : "subtle"}
                      color="brand"
                      size="sm"
                      onClick={() => {
                        onViewModeChange("carousel");
                      }}
                      aria-label="Carousel view"
                    >
                      <IconLayoutColumns size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Grid view">
                    <ActionIcon
                      variant={viewMode === "grid" ? "filled" : "subtle"}
                      color="brand"
                      size="sm"
                      onClick={() => {
                        onViewModeChange("grid");
                      }}
                      aria-label="Grid view"
                    >
                      <IconLayoutGrid size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="List view">
                    <ActionIcon
                      variant={viewMode === "list" ? "filled" : "subtle"}
                      color="brand"
                      size="sm"
                      onClick={() => {
                        onViewModeChange("list");
                      }}
                      aria-label="List view"
                    >
                      <IconLayoutList size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Table view">
                    <ActionIcon
                      variant={viewMode === "table" ? "filled" : "subtle"}
                      color="brand"
                      size="sm"
                      onClick={() => {
                        onViewModeChange("table");
                      }}
                      aria-label="Table view"
                    >
                      <IconTable size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Divider orientation="vertical" />
                <Button variant="light" size="sm" onClick={onClear}>
                  Clear
                </Button>
              </Group>
            ))}
        </Group>
      </Box>
    </Paper>
  );
}

/**
 * Truncate text to specified length and add ellipsis
 */
function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
