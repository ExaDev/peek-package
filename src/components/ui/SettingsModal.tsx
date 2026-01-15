import { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';

export function SettingsModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const [token, setToken] = useState('');

  const handleSave = () => {
    if (token) {
      localStorage.setItem('github_token', token);
      close();
    }
  };

  const handleClear = () => {
    localStorage.removeItem('github_token');
    setToken('');
    close();
  };

  return (
    <>
      <ActionIcon variant="subtle" color="gray" onClick={open}>
        <IconSettings size={20} />
      </ActionIcon>

      <Modal opened={opened} onClose={close} title="Settings">
        <Stack gap="md">
          <Alert title="GitHub Token" color="blue">
            <Text size="sm">
              Adding a GitHub personal access token increases rate limits from
              60 to 5,000 requests per hour.
            </Text>
          </Alert>

          <TextInput
            label="GitHub Personal Access Token"
            placeholder="ghp_xxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.currentTarget.value)}
            type="password"
          />

          <Group justify="flex-end">
            <Button variant="light" color="red" onClick={handleClear}>
              Clear Token
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
