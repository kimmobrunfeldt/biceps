import {
  ActionIcon,
  Box,
  Flex,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconInfoCircle, IconX } from '@tabler/icons-react'
import pluralize from 'pluralize'
import { useCallback } from 'react'
import { GrayText } from 'src/components/GrayText'
import { Link } from 'src/components/Link'
import { PaperContainer } from 'src/components/PaperContainer'
import { ProductImage } from 'src/components/ProductImage'
import { Query } from 'src/components/Query'
import classes from 'src/components/Table.module.css'
import { TableHeader } from 'src/components/TableHeader'
import { TableSkeleton } from 'src/components/TableSkeleton'
import { ProductResolved } from 'src/db/schemas/ProductSchema'
import {
  useDeleteProduct,
  useGetAllCustomProducts,
  useLazyGetRecipesByProductId,
} from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { usePaginatedQuery } from 'src/hooks/usePaginatedQuery'
import { formatRoute, routes } from 'src/routes'
import { formatGrams, formatKcal } from 'src/utils/format'

type Props = {
  useData: typeof useGetAllCustomProducts
  showRemove?: boolean
}

export function ProductsTable(props: Props) {
  const {
    pageSize,
    setPageSize,
    pageIndex,
    setPageIndex,
    queryResult,
    shouldShowPagination,
    totalPages,
    pageSizes,
  } = usePaginatedQuery(props.useData)
  const { withNotifications } = useNotifications()
  const { deleteProduct } = useDeleteProduct()
  const { getRecipesByProductId } = useLazyGetRecipesByProductId()

  const onProductRemove = useCallback(
    async (product: ProductResolved) => {
      async function executeDelete() {
        await withNotifications({
          fn: async () => {
            await deleteProduct(product.id)
          },
          success: {
            message: `Product '${product.name}' deleted`,
            color: 'green',
          },
          error: {
            message: 'Failed to delete product!',
            color: 'red',
            icon: <IconX />,
          },
        })
      }

      const recipes = await getRecipesByProductId(product.id)
      const text =
        recipes.length > 0 ? (
          <>
            Deletion{' '}
            <b>will affect {pluralize('recipe', recipes.length, true)}</b> where
            the product is used.
          </>
        ) : (
          <>The product is not used in any recipe at the moment.</>
        )

      modals.openConfirmModal({
        title: `Delete '${product.name}'?`,
        children: <Text size="sm">{text}</Text>,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        closeOnConfirm: true,
        onConfirm: executeDelete,
      })
    },
    [getRecipesByProductId, withNotifications, deleteProduct]
  )

  return (
    <Query
      result={queryResult}
      whenEmpty={() => <PlainTable products={[]} />}
      whenLoading={<TableSkeleton />}
    >
      {({ results, totalCount }) => {
        return (
          <Stack gap="md">
            <PaperContainer>
              <PlainTable
                {...props}
                products={results}
                onRemove={onProductRemove}
              />
            </PaperContainer>

            {shouldShowPagination ? (
              <Flex justify="space-between" gap="md">
                <Flex
                  gap="xs"
                  direction={{ base: 'column', md: 'row' }}
                  align={{ base: 'flex-start', md: 'center' }}
                >
                  <Pagination
                    total={totalPages}
                    value={pageIndex + 1}
                    onChange={(value) => setPageIndex(value - 1)}
                  />
                  <GrayText>{totalCount} products in total</GrayText>
                </Flex>
                <Select
                  data={pageSizes.map((size) => ({
                    value: String(size),
                    label: `${size} per page`,
                  }))}
                  value={String(pageSize)}
                  onChange={(val) => setPageSize(Number(val))}
                />
              </Flex>
            ) : null}
          </Stack>
        )
      }}
    </Query>
  )
}

type PlainTableProps = Pick<Props, 'showRemove'> & {
  onRemove?: (product: ProductResolved) => void
  products: ProductResolved[]
}

function PlainTable({
  products,
  onRemove,
  showRemove = false,
}: PlainTableProps) {
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
        <Table.Tbody>{rows.length === 0 ? emptyRow : rows}</Table.Tbody>
      </Table>
    </Box>
  )
}
