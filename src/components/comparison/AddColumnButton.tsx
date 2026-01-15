import { ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

const MAX_PACKAGES = 6;

interface AddColumnButtonProps {
  onClick: () => void;
  disabled: boolean;
  currentColumnCount: number;
}

export function AddColumnButton({
  onClick,
  disabled,
  currentColumnCount,
}: AddColumnButtonProps) {
  const remainingSlots = MAX_PACKAGES - currentColumnCount;

  const button = (
    <Box
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: "0",
      }}
    >
      <ActionIcon
        variant="light"
        size="xl"
        radius="md"
        onClick={onClick}
        disabled={disabled}
        aria-label={`Add package column${disabled ? ` (maximum of ${String(MAX_PACKAGES)} packages reached)` : ""}`}
        style={{
          flexShrink: 0,
        }}
      >
        <IconPlus size={24} />
      </ActionIcon>
      {!disabled && (
        <Box
          style={{
            marginLeft: "8px",
            marginTop: "4px",
            fontSize: "0.75rem",
            color: "var(--mantine-color-dimmed)",
          }}
        >
          Add ({remainingSlots} remaining)
        </Box>
      )}
    </Box>
  );

  if (disabled) {
    return (
      <Tooltip
        label={`Maximum of ${String(MAX_PACKAGES)} packages reached`}
        position="top"
        withArrow
      >
        {button}
      </Tooltip>
    );
  }

  return button;
}
