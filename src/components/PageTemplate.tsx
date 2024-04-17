import { Box, BoxProps } from '@mantine/core'
import { PageTitleBar } from 'src/components/PageTitleBar'

type Props = {
  title: string
  titleRightSection?: React.ReactNode
  children?: React.ReactNode
} & BoxProps

export function PageTemplate({
  title,
  titleRightSection,
  children,
  ...rest
}: Props) {
  return (
    <Box px="xl" pt="lg" pb="xl" {...rest}>
      <PageTitleBar title={title} rightSection={titleRightSection} pb="md" />
      {children}
    </Box>
  )
}
