import { Text, TextProps } from '@mantine/core'
import classes from './GrayText.module.css'

type Props = {
  children: React.ReactNode
} & TextProps

export function GrayText(props: Props) {
  return <Text className={classes.text} {...props} />
}
