import { Paper } from '@mantine/core'
import classes from './PaperContainer.module.css'

type Props = {
  children: React.ReactNode
} & React.ComponentProps<typeof Paper>

export function PaperContainer({ children, ...rest }: Props) {
  return (
    <Paper px="sm" py="lg" radius="sm" className={classes.container} {...rest}>
      {children}
    </Paper>
  )
}
