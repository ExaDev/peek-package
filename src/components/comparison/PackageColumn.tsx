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
          onUpdate({ value: newValue, searchQuery: newValue });
        }}
        onRemove={showRemove ? onRemove : undefined}
        showRemove={showRemove}
      />

      {/* Metrics Panel */}
      <div style={{ flex: 1 }}>
        <PackageMetricsPanel
          packageStats={packageStats}
          isLoading={isLoading}
          winnerMetrics={winnerMetrics}
        />
      </div>
    </div>
  );
}
