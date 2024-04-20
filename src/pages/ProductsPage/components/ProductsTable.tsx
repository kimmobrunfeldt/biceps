import { ActionIcon, BoxProps, Flex, Table, Text, Tooltip } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { ItemImage } from 'src/components/ItemImage'
import { ItemResolved } from 'src/db/schemas/ItemSchema'
import { formatGrams, formatKcal } from 'src/utils/format'

type Props = {
  products: ItemResolved[]
  showRemove?: boolean
  onRemove?: (product: ItemResolved) => void
}

export function ProductsTable({
  products,
  showRemove = false,
  onRemove,
}: Props) {
  const rows = products.map((product, index) => {
    return (
      <Table.Tr key={index}>
        <Table.Td>
          <Flex align="center" gap="sm">
            <ItemImage item={product} />
            <Text>{product.name}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>{formatKcal(product.kcal)}</Table.Td>
        <Table.Td>{formatGrams(product.protein)}</Table.Td>
        <Table.Td>{formatGrams(product.fatTotal)}</Table.Td>
        <Table.Td>{formatGrams(product.fatSaturated)}</Table.Td>
        <Table.Td>{formatGrams(product.carbsTotal)}</Table.Td>
        <Table.Td>{formatGrams(product.carbsSugar)}</Table.Td>
        <Table.Td>{formatGrams(product.salt)}</Table.Td>
        <Table.Td>
          {showRemove ? (
            <Tooltip label="Remove product">
              <ActionIcon
                aria-label="Remove"
                radius="lg"
                size="sm"
                color="red"
                onClick={onRemove?.bind(null, product)}
              >
                <IconX height="70%" />
              </ActionIcon>
            </Tooltip>
          ) : null}
        </Table.Td>
      </Table.Tr>
    )
  })

  const style: BoxProps['style'] = {
    whiteSpace: 'nowrap',
  }
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th miw={200}>Item</Table.Th>
          <Table.Th style={style}>Kcal (per 100g)</Table.Th>
          <Table.Th style={style}>Protein (per 100g)</Table.Th>
          <Table.Th style={style}>Fat (per 100g)</Table.Th>
          <Table.Th>Saturated fat&nbsp;(per 100g)</Table.Th>
          <Table.Th style={style}>Carbs (per 100g)</Table.Th>
          <Table.Th style={style}>Sugar (per 100g)</Table.Th>
          <Table.Th style={style}>Salt (per 100g)</Table.Th>
          <Table.Th style={style}></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  )
}
