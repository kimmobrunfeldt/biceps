import { Box, Skeleton } from '@mantine/core'

type Props = React.ComponentProps<typeof Box>

export function TableSkeleton(props: Props) {
  return (
    <Box p="sm" maw={700} {...props}>
      <Skeleton height={10} mt={6} width="40%" radius="xl" />
      <Skeleton height={10} mt={20} width="80%" radius="xl" />
      <Skeleton height={10} mt={6} width="80%" radius="xl" />
      <Skeleton height={10} mt={6} width="80%" radius="xl" />
    </Box>
  )
}
