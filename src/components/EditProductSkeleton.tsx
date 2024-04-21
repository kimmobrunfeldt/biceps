import { Box, Flex, Skeleton } from '@mantine/core'

type Props = React.ComponentProps<typeof Box>

export function EditProductSkeleton(props: Props) {
  return (
    <Box maw={360} {...props}>
      <Flex w="100%">
        <Box w="67%">
          <Skeleton height={12} mt={20} width="80%" radius="md" />
          <Skeleton height={12} mt={20} width="80%" radius="md" />
          <Skeleton height={12} mt={20} width="80%" radius="md" />
          <Skeleton height={12} mt={20} width="80%" radius="md" />
          <Skeleton height={12} mt={20} width="80%" radius="md" />
        </Box>
        <Box>
          <Skeleton mt={35} height={90} circle />
        </Box>
      </Flex>
    </Box>
  )
}
