import { Box, Flex, Skeleton } from '@mantine/core'

type Props = React.ComponentProps<typeof Box>

export function EditRecurringEventSkeleton(props: Props) {
  return (
    <Box maw={360} {...props}>
      <Flex w="100%">
        <Box w="67%">
          <Skeleton height={12} mt={20} width="80%" radius="md" />
          <Skeleton height={12} mt={20} width="80%" radius="md" />
          <Skeleton height={12} mt={20} width="80%" radius="md" />
          <Skeleton height={12} mt={20} width="80%" radius="md" />
        </Box>
      </Flex>
    </Box>
  )
}
