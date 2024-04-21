import { Box, BoxProps } from '@mantine/core'
import { PageTitleBar } from 'src/components/PageTitleBar'
import classes from './PageTemplate.module.css'

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
    <Box className={classes.container} {...rest}>
      <PageTitleBar title={title} rightSection={titleRightSection} pb="md" />
      {children}
    </Box>
  )
}
