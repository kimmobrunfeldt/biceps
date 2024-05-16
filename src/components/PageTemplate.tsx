import { Box, BoxProps } from '@mantine/core'
import { PageTitleBar } from 'src/components/PageTitleBar'
import { useScrollToTopInitially } from 'src/hooks/useScrollToTopInitially'
import classes from './PageTemplate.module.css'

type Props = {
  title: string
  titleRightSection?: React.ReactNode
  children?: React.ReactNode
  description?: string | React.ReactNode
} & BoxProps

export function PageTemplate({
  title,
  titleRightSection,
  description,
  children,
  ...rest
}: Props) {
  useScrollToTopInitially()

  return (
    <Box maw={1700} mx="auto" className={classes.container} {...rest}>
      <Box pb="md">
        <PageTitleBar
          title={title}
          rightSection={titleRightSection}
          description={description}
        />
      </Box>
      {children}
    </Box>
  )
}
