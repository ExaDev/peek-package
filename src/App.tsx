import { useState } from 'react';
import {
  Alert,
  Container,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { PackageInput } from './components/comparison/PackageInput';
import { ComparisonTable } from './components/comparison/ComparisonTable';
import { ReadmeAccordion } from './components/ui/ReadmeAccordion';
import { SettingsModal } from './components/ui/SettingsModal';
import { usePackageComparison } from './hooks/usePackageComparison';
import { ComparatorService } from './services/comparator';

function App() {
  const [packageNames, setPackageNames] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const { isLoading, isError, errors, packages } =
    usePackageComparison(packageNames);

  const comparator = new ComparatorService();
  const comparison = packages.length > 0 ? comparator.compareMany(packages) : null;

  const handleCompare = (names: string[]) => {
    setPackageNames(names);
    setShowComparison(true);
  };

  const getErrorMessage = () => {
    if (errors.length === 0) return 'Failed to load package data';
    if (errors.length === 1) return errors[0].message;
    return `${errors.length} packages failed to load`;
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title>PkgCompare</Title>
        <SettingsModal />
      </Group>

      <Stack gap="xl">
        <PackageInput onCompare={handleCompare} loading={isLoading} />

        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
          >
            {getErrorMessage()}
          </Alert>
        )}

        {showComparison && comparison && (
          <>
            <ComparisonTable comparison={comparison} />

            <Stack gap="md">
              <Title order={3}>READMEs</Title>
              <ReadmeAccordion packages={packages} />
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  );
}

export default App;
