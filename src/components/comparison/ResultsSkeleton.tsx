import { Card, Grid, Skeleton, Stack } from "@mantine/core";

export function ResultsSkeleton() {
  return (
    <Stack gap="md">
      <Grid>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card padding="lg" withBorder>
              <Stack gap="md">
                <Skeleton height={24} width="60%" mb="sm" />
                <Skeleton height={16} width="100%" />
                <Skeleton height={16} width="80%" />
                <Skeleton height={16} width="90%" />
                <Skeleton height={32} mt="md" />
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
