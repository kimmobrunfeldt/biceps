import { Box, InputLabel, Skeleton, Stack } from '@mantine/core'

type Props = {
  label: string
  maw?: number
}

export function InputSkeleton({ label, maw }: Props) {
  return (
    <Box>
      <InputLabel>{label}</InputLabel>
      {/* Couldn't find a way to refer to mantine input variables var(--input-size) */}
      <Stack h={36} justify="center">
        <Skeleton height={12} maw={maw} radius="xl" />
      </Stack>
    </Box>
  )
}
