import { BoxProps, Flex, Stack, Title } from '@mantine/core'
import { GrayText } from 'src/components/GrayText'
import { PAGE_DESCRIPTION_MAX_WIDTH } from 'src/constants'

type Props = {
  title: string
  description?: string | React.ReactNode
  rightSection?: React.ReactNode
} & BoxProps

export function PageTitleBar({
  title,
  rightSection,
  description,
  ...rest
}: Props) {
  return (
    <Flex align="start" justify="space-between" gap="xl" {...rest}>
      <Stack gap="xs">
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
        {description ? (
          <GrayText mb="xl" maw={PAGE_DESCRIPTION_MAX_WIDTH} strong>
            {description}
          </GrayText>
        ) : null}
      </Stack>
      {rightSection ? rightSection : null}
    </Flex>
  )
}
