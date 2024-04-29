import { Box, Flex, FlexProps } from '@mantine/core'
import { GrayText } from 'src/components/GrayText'

type Props = {
  text: string
  unitInSameRow?: boolean
  unit?: string
}

export function TableHeader({ text, unit, unitInSameRow = false }: Props) {
  const flexProps: FlexProps = unitInSameRow
    ? { direction: 'row', align: 'center', gap: 6 }
    : { direction: 'column' }
  return (
    <Flex {...flexProps}>
      <Box>{text}</Box>
      {unit ? <GrayText fz="sm">{unit}</GrayText> : null}
    </Flex>
  )
}
