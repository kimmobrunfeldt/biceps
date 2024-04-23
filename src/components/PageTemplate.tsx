import { Box, BoxProps, Text } from '@mantine/core'
import { PageTitleBar } from 'src/components/PageTitleBar'
import classes from './PageTemplate.module.css'

type Props = {
  title: string
  titleRightSection?: React.ReactNode
  children?: React.ReactNode
  description?: string
} & BoxProps

export function PageTemplate({
  title,
  titleRightSection,
  description,
  children,
  ...rest
}: Props) {
  return (
    <Box className={classes.container} {...rest}>
      <Box pb="md">
        <PageTitleBar title={title} rightSection={titleRightSection} mb="sm" />
        {description ? (
          <Text c="gray" mb="xl" maw={600}>
            {description}
          </Text>
        ) : null}
      </Box>
      {children}
    </Box>
  )
}
