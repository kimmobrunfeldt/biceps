import { ActionIcon, BoxProps, Flex, Table, Text, Tooltip } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { NutritionCircle } from 'src/components/NutritionCircle'
import { ProductImage } from 'src/components/ProductImage'
import { ProductResolved } from 'src/db/schemas/ProductSchema'
import { formatRoute, routes } from 'src/routes'
import { formatGrams, formatKcal } from 'src/utils/format'
import { Link } from 'wouter'

type Props = {
  products: ProductResolved[]
  showRemove?: boolean
  onRemove?: (product: ProductResolved) => void
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
            <Flex gap={4}>
              <NutritionCircle nutrition={product} variant="icon" />
              <ProductImage product={product} />
            </Flex>
            <Link
              to={formatRoute(routes.products.edit.path, { id: product.id })}
            >
              <Text>{product.name}</Text>
            </Link>
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
                variant="light"
                aria-label="Remove"
                radius="lg"
                size="sm"
                onClick={onRemove?.bind(null, product)}
                color="red"
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
    <Table.ScrollContainer minWidth={360}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th miw={260}>Item</Table.Th>
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
    </Table.ScrollContainer>
  )
}
