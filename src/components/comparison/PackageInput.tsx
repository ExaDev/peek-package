import { useState } from 'react';
import { ActionIcon, Button, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

const MAX_PACKAGES = 6;
const MIN_PACKAGES = 2;

interface PackageInputProps {
  onCompare: (packageNames: string[]) => void;
  loading?: boolean;
}

export function PackageInput({ onCompare, loading }: PackageInputProps) {
  const [packages, setPackages] = useState<string[]>(['', '']);

  const handleAddPackage = () => {
    if (packages.length < MAX_PACKAGES) {
      setPackages([...packages, '']);
    }
  };

  const handleRemovePackage = (index: number) => {
    if (packages.length > MIN_PACKAGES) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const handlePackageChange = (index: number, value: string) => {
    const newPackages = [...packages];
    newPackages[index] = value;
    setPackages(newPackages);
  };

  const handleSubmit = () => {
    const validPackages = packages.filter((p) => p.trim().length > 0);

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
    packages.filter((p) => p.trim().length > 0).length >= MIN_PACKAGES;
  const hasDuplicates =
    new Set(packages.filter((p) => p.trim().length > 0)).size !==
    packages.filter((p) => p.trim().length > 0).length;

  return (
    <Stack gap="md">
      <Title order={2}>Compare npm Packages</Title>

      {packages.map((value, index) => (
        <Group key={index} gap="md">
          <TextInput
            label={`Package ${index + 1}`}
            placeholder="e.g., react"
            required
            value={value}
            onChange={(e) => handlePackageChange(index, e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          {packages.length > MIN_PACKAGES && (
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={() => handleRemovePackage(index)}
              mt={index === 0 ? 23 : 0}
            >
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
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
