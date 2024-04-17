import { Card, Progress, Text } from '@mantine/core'
import { PageTemplate } from 'src/components/PageTemplate'

export function IndexPage() {
  return (
    <PageTemplate title="Home">
      <Card withBorder radius="md" padding="xl" bg="var(--mantine-color-body)">
        <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
          Calories today
        </Text>
        <Text fz="lg" fw={500}>
          2100 / 2980 kcal
        </Text>
        <Progress value={70.31} mt="md" size="lg" radius="xl" />
      </Card>
    </PageTemplate>
  )
}
