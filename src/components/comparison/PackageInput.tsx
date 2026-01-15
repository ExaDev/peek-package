import { useState } from 'react';
import { ActionIcon, Autocomplete, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePackageSearch } from '@/hooks/usePackageSearch';

const MAX_PACKAGES = 6;
const MIN_PACKAGES = 2;
const DEBOUNCE_DELAY = 300;

interface PackageInputProps {
  onCompare: (packageNames: string[]) => void;
  loading?: boolean;
}

interface PackageSearchState {
  value: string;
  searchQuery: string;
}

export function PackageInput({ onCompare, loading }: PackageInputProps) {
  // Each input has both a value and a search query for autocomplete
  const [packages, setPackages] = useState<PackageSearchState[]>([
    { value: '', searchQuery: '' },
    { value: '', searchQuery: '' },
  ]);

  const handleAddPackage = () => {
    if (packages.length < MAX_PACKAGES) {
      setPackages([...packages, { value: '', searchQuery: '' }]);
    }
  };

  const handleRemovePackage = (index: number) => {
    if (packages.length > MIN_PACKAGES) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const handlePackageChange = (index: number, value: string) => {
    const newPackages = [...packages];
    newPackages[index] = { ...newPackages[index], value, searchQuery: value };
    setPackages(newPackages);
  };

  const handleSubmit = () => {
    const validPackages = packages
      .map((p) => p.value)
      .filter((p) => p.trim().length > 0);

    if (validPackages.length < MIN_PACKAGES) {
      return;
    }

    const uniquePackages = Array.from(new Set(validPackages));
    if (uniquePackages.length !== validPackages.length) {
      return;
    }

    onCompare(uniquePackages);
  };

  const canAddMore = packages.length < MAX_PACKAGES;
  const hasEnoughValidPackages =
    packages.filter((p) => p.value.trim().length > 0).length >= MIN_PACKAGES;
  const hasDuplicates =
    new Set(
      packages.map((p) => p.value).filter((p) => p.trim().length > 0)
    ).size !==
    packages.map((p) => p.value).filter((p) => p.trim().length > 0).length;

  return (
    <Stack gap="md">
      <Title order={2}>Compare npm Packages</Title>

      {packages.map((pkg, index) => (
        <PackageAutocompleteInput
          key={index}
          index={index}
          value={pkg.value}
          searchQuery={pkg.searchQuery}
          onChange={(value) => handlePackageChange(index, value)}
          onRemove={packages.length > MIN_PACKAGES ? () => handleRemovePackage(index) : undefined}
          showRemove={packages.length > MIN_PACKAGES}
        />
      ))}

      {hasDuplicates && (
        <Text c="red" size="sm">
          Please enter unique package names
        </Text>
      )}

      <Group justify="space-between">
        {canAddMore && (
          <Button variant="light" onClick={handleAddPackage}>
            + Add Package
          </Button>
        )}
        <Button
          type="submit"
          leftSection={<IconSearch size={16} />}
          loading={loading}
          disabled={!hasEnoughValidPackages || hasDuplicates}
          onClick={handleSubmit}
        >
          Compare
        </Button>
      </Group>
    </Stack>
  );
}

interface PackageAutocompleteInputProps {
  index: number;
  value: string;
  searchQuery: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  showRemove: boolean;
}

function PackageAutocompleteInput({
  index,
  value,
  searchQuery,
  onChange,
  onRemove,
  showRemove,
}: PackageAutocompleteInputProps) {
  // Debounce the search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // Fetch search suggestions using the debounced query
  const { data: searchResults, isLoading } = usePackageSearch(debouncedSearchQuery);

  // Format search results for Autocomplete component
  // Use group format to store additional data for custom rendering
  const suggestions =
    (searchResults || []).slice(0, 8).map((result) => {
      const name = result.package.name;
      return {
        value: name,
        label: name,
        description: truncate(result.package.description, 60),
      };
    }) || [];

  return (
    <Group gap="md">
      <Autocomplete
        label={`Package ${index + 1}`}
        placeholder="e.g., react"
        required
        value={value}
        onChange={(newValue) => {
          onChange(newValue);
        }}
        data={suggestions}
        limit={8}
        style={{ flex: 1 }}
        rightSection={isLoading ? <div style={{ width: 16 }} /> : undefined}
        // Custom option rendering to show description
        renderOption={({ option }) => (
          <div>
            <div style={{ fontWeight: 500 }}>{option.value}</div>
            {(option as any).description && (
              <div style={{ fontSize: '0.85em', opacity: 0.7 }}>
                {(option as any).description}
              </div>
            )}
          </div>
        )}
      />
      {showRemove && onRemove && (
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={onRemove}
          mt={index === 0 ? 23 : 0}
        >
          <IconX size={16} />
        </ActionIcon>
      )}
    </Group>
  );
}

/**
 * Truncate text to specified length and add ellipsis
 */
function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
