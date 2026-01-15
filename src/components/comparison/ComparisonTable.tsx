import { Table, Text } from '@mantine/core';
import type { NPackageComparison } from '@/types/adapter';

interface ComparisonTableProps {
  comparison: NPackageComparison;
}

export function ComparisonTable({ comparison }: ComparisonTableProps) {
  const { packages, metricComparisons } = comparison;

  const formatValue = (value: number | string | null): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Table striped highlightOnHover style={{ tableLayout: 'auto' }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ position: 'sticky', left: 0, backgroundColor: 'inherit', zIndex: 1 }}>
            Metric
          </Table.Th>
          {packages.map((pkg) => (
            <Table.Th key={pkg.name}>{pkg.name}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {metricComparisons.map((metric) => (
          <Table.Tr key={metric.name}>
            <Table.Td style={{ position: 'sticky', left: 0, backgroundColor: 'inherit', zIndex: 1 }}>
              <Text fw={500}>{metric.name}</Text>
            </Table.Td>
            {metric.values.map((value) => (
              <Table.Td
                key={value.packageIndex}
                style={{
                  fontWeight: value.isWinner ? 'bold' : 'normal',
                  color: value.isWinner ? 'var(--mantine-color-blue-9)' : undefined,
                }}
              >
                {formatValue(value.value)}
                {value.percentDiff !== undefined && value.value !== null && (
                  <Text size="xs" c="dimmed">
                    {value.percentDiff > 0 ? '+' : ''}
                    {value.percentDiff.toFixed(1)}%
                  </Text>
                )}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
