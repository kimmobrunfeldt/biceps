import { BoxProps, Flex, Title } from '@mantine/core'

type Props = {
  title: string
  rightSection?: React.ReactNode
} & BoxProps

export function PageTitleBar({ title, rightSection, ...rest }: Props) {
  return (
    <Flex align="start" justify="space-between" {...rest}>
      <Title
        order={1}
        size="sm"
        opacity={0.7}
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.1rem',
          fontWeight: 900,
        }}
      >
        {title}
      </Title>
      {rightSection ? rightSection : null}
    </Flex>
  )
}
