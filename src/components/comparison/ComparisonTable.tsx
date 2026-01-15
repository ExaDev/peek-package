import { Table, Text } from "@mantine/core";
import type { NPackageComparison } from "@/types/adapter";

interface ComparisonTableProps {
  comparison: NPackageComparison;
}

export function ComparisonTable({ comparison }: ComparisonTableProps) {
  const { packages, metricComparisons } = comparison;

  const formatValue = (value: number | string | null): string => {
    if (value === null) return "N/A";
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value;
  };

  const winners = metricComparisons
    .filter((m) => m.values.some((v) => v.isWinner))
    .map((m) => {
      const winnerIndex = m.values.findIndex((v) => v.isWinner);
      return `${m.name}: ${packages[winnerIndex].name}`;
    });

  const winnerAnnouncement =
    winners.length > 0
      ? `Top performers: ${winners.join(". ")}`
      : `Comparing ${String(packages.length)} packages`;

  return (
    <div role="region" aria-label="Package comparison results">
      <h2 id="comparison-title" className="visually-hidden">
        Comparing {packages.length} packages
      </h2>
      <Table
        striped
        highlightOnHover
        style={{ tableLayout: "auto" }}
        aria-describedby="comparison-caption"
      >
        <caption id="comparison-caption" className="visually-hidden">
          {winnerAnnouncement}
        </caption>
        <Table.Thead>
          <Table.Tr>
            <Table.Th
              style={{
                position: "sticky",
                left: 0,
                backgroundColor: "inherit",
                zIndex: 1,
              }}
              scope="col"
            >
              Metric
            </Table.Th>
            {packages.map((pkg) => (
              <Table.Th key={pkg.name} scope="col">
                {pkg.name}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {metricComparisons.map((metric) => (
            <Table.Tr key={metric.name}>
              <Table.Td
                style={{
                  position: "sticky",
                  left: 0,
                  backgroundColor: "inherit",
                  zIndex: 1,
                }}
                scope="row"
              >
                <Text fw={500}>{metric.name}</Text>
              </Table.Td>
              {metric.values.map((value) => (
                <Table.Td
                  key={value.packageIndex}
                  style={{
                    fontWeight: value.isWinner ? "bold" : "normal",
                    color: value.isWinner
                      ? "var(--mantine-color-blue-9)"
                      : undefined,
                  }}
                  aria-label={
                    value.isWinner
                      ? `${packages[value.packageIndex].name} has the best ${metric.name}`
                      : undefined
                  }
                >
                  {formatValue(value.value)}
                  {value.percentDiff !== undefined && value.value !== null && (
                    <Text size="xs" c="dimmed">
                      {value.percentDiff > 0 ? "+" : ""}
                      {value.percentDiff.toFixed(1)}%
                    </Text>
                  )}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <style>{`.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`}</style>
    </div>
  );
}
