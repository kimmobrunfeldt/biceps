import { Text, TextProps } from '@mantine/core'
import classes from './GrayText.module.css'

type Props = {
  children: React.ReactNode
  strong?: boolean
} & TextProps

export function GrayText({ strong, ...props }: Props) {
  return (
    <Text className={strong ? classes.textStrong : classes.text} {...props} />
  )
}
