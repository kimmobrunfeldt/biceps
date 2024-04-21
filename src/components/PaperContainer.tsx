import { Paper } from '@mantine/core'
import classes from './PaperContainer.module.css'

type Props = {
  children: React.ReactNode
} & React.ComponentProps<typeof Paper>

export function PaperContainer({ children, ...rest }: Props) {
  return (
    <Paper
      px="md"
      pt="lg"
      pb="xl"
      radius="md"
      className={classes.container}
      {...rest}
    >
      {children}
    </Paper>
  )
}
