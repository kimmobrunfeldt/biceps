import { Box, Skeleton } from '@mantine/core'

type Props = React.ComponentProps<typeof Box>

export function EditRecipeSkeleton(props: Props) {
  return (
    <Box {...props}>
      <Skeleton height={12} mt={30} width="30%" radius="md" />

      <Skeleton height={12} mt={60} width="80%" radius="md" />
      <Skeleton height={12} mt={20} width="80%" radius="md" />
      <Skeleton height={12} mt={20} width="80%" radius="md" />
      <Skeleton height={12} mt={20} width="80%" radius="md" />
    </Box>
  )
}
