import { ActionIcon, Box, Flex, Table, Text, Tooltip } from '@mantine/core'
import { IconInfoCircle, IconX } from '@tabler/icons-react'
import { Link } from 'src/components/Link'
import { ProductImage } from 'src/components/ProductImage'
import classes from 'src/components/Table.module.css'
import { TableHeader } from 'src/components/TableHeader'
import { ProductResolved } from 'src/db/schemas/ProductSchema'
import { formatRoute, routes } from 'src/routes'
import { formatGrams, formatKcal } from 'src/utils/format'

type Props = {
  products: ProductResolved[]
  showRemove?: boolean
  onRemove?: (product: ProductResolved) => void
  empty?: boolean
}

export function ProductsTable({
  products,
  onRemove,
  showRemove = false,
  empty = false,
}: Props) {
  const rows = products.map((product, index) => {
    return (
      <Table.Tr key={index}>
        <Table.Td>
          <Flex align="center" gap={12}>
            <ProductImage product={product} />

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

  const emptyRow = (
    <Table.Tr>
      <Table.Td>
        <Flex direction="row" align="center" gap={4} opacity={0.7} py="sm">
          <IconInfoCircle width={20} color="gray" />
          <Text c="gray">No products</Text>
        </Flex>
      </Table.Td>
    </Table.Tr>
  )

  return (
    <Box className={classes.tableContainer}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th miw={260}>Product</Table.Th>
            <Table.Th>
              <TableHeader text="Kcal" unit="(per 100g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader text="Protein" unit="(per 100g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader text="Fat" unit="(per 100g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader text="Saturated fat" unit="(per 100g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader text="Carbs" unit="(per 100g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader text="Sugar" unit="(per 100g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader text="Salt" unit="(per 100g)" />
            </Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{empty ? emptyRow : rows}</Table.Tbody>
      </Table>
    </Box>
  )
}
