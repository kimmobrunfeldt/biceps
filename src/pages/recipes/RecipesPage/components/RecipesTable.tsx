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
import { NutritionCircle } from 'src/components/NutritionCircle'
import { PaperContainer } from 'src/components/PaperContainer'
import { Query } from 'src/components/Query'
import classes from 'src/components/Table.module.css'
import { TableHeader } from 'src/components/TableHeader'
import { TableSkeleton } from 'src/components/TableSkeleton'
import { RecipeResolved } from 'src/db/schemas/RecipeSchema'
import {
  useDeleteRecipe,
  useGetAllRecipes,
  useLazyGetRecurringEventsByRecipeId,
} from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { usePaginatedQuery } from 'src/hooks/usePaginatedQuery'
import { calculateTotals } from 'src/pages/recipes/AddRecipePage/components/RecipeItemsTable'
import { formatRoute, routes } from 'src/routes'
import { formatGrams, formatKcal } from 'src/utils/format'

type Props = {
  amountsPerPortion?: boolean
  showRemove?: boolean
}

export function RecipesTable(props: Props) {
  const {
    pageSize,
    setPageSize,
    pageIndex,
    setPageIndex,
    queryResult,
    shouldShowPagination,
    totalPages,
    pageSizes,
  } = usePaginatedQuery(useGetAllRecipes)
  const { withNotifications } = useNotifications()
  const { deleteRecipe } = useDeleteRecipe()
  const { getRecurringEventsByRecipeId } = useLazyGetRecurringEventsByRecipeId()

  const onRecipeRemove = useCallback(
    async (recipe: RecipeResolved) => {
      async function executeDelete() {
        await withNotifications({
          fn: async () => {
            await deleteRecipe(recipe.id)
          },
          success: {
            message: `Recipe '${recipe.name}' deleted`,
            color: 'green',
          },
          error: {
            message: 'Failed to delete recipe!',
            color: 'red',
            icon: <IconX />,
          },
        })
      }

      const recurringEvents = await getRecurringEventsByRecipeId(recipe.id)
      const text =
        recurringEvents.length > 0 ? (
          <>
            Deletion{' '}
            <b>
              will affect{' '}
              {pluralize('meal plans', recurringEvents.length, true)}
            </b>{' '}
            where the recipe is referred.
          </>
        ) : (
          <>The recipe is not used in any mean plans at the moment.</>
        )

      modals.openConfirmModal({
        title: `Delete '${recipe.name}'?`,
        children: <Text size="sm">{text}</Text>,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        closeOnConfirm: true,
        onConfirm: executeDelete,
      })
    },
    [getRecurringEventsByRecipeId, withNotifications, deleteRecipe]
  )

  return (
    <Query
      result={queryResult}
      whenEmpty={() => <PlainTable recipes={[]} />}
      whenLoading={<TableSkeleton />}
    >
      {({ results, totalCount }) => {
        return (
          <Stack gap="md">
            <PaperContainer>
              <PlainTable
                {...props}
                recipes={results}
                onRemove={onRecipeRemove}
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
                  <GrayText>{totalCount} recipes in total</GrayText>
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

type PlainTableProps = Props & {
  recipes: RecipeResolved[]
  onRemove?: (recipe: RecipeResolved) => void
}

export function PlainTable({
  recipes,
  showRemove = false,
  onRemove,
  amountsPerPortion = true,
}: PlainTableProps) {
  const rows = recipes.map((recipe, index) => {
    const values = calculateTotals(recipe.recipeItems, {
      amountsPerPortion,
      portions: recipe.portions,
    })
    return (
      <Table.Tr key={index}>
        <Table.Td>
          <Flex align="center" gap={4}>
            <Flex gap={4}>
              <NutritionCircle
                nutrition={values}
                variant="icon"
                weightGrams={values.weightGrams}
              />
            </Flex>
            <Link to={formatRoute(routes.recipes.edit.path, { id: recipe.id })}>
              <Text>{recipe.name}</Text>
            </Link>
          </Flex>
        </Table.Td>
        <Table.Td>{recipe.portions}</Table.Td>
        <Table.Td>{formatGrams(values.weightGrams)}</Table.Td>
        <Table.Td>{formatKcal(values.kcal)}</Table.Td>
        <Table.Td>{formatGrams(values.protein)}</Table.Td>
        <Table.Td>{formatGrams(values.fatTotal)}</Table.Td>
        <Table.Td>{formatGrams(values.fatSaturated)}</Table.Td>
        <Table.Td>{formatGrams(values.carbsTotal)}</Table.Td>
        <Table.Td>{formatGrams(values.carbsSugar)}</Table.Td>
        <Table.Td>{formatGrams(values.salt)}</Table.Td>
        <Table.Td>
          {showRemove ? (
            <Tooltip label="Remove recipe">
              <ActionIcon
                variant="light"
                aria-label="Remove"
                radius="lg"
                size="sm"
                onClick={onRemove?.bind(null, recipe)}
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
          <Text c="gray">No recipes</Text>
        </Flex>
      </Table.Td>
    </Table.Tr>
  )

  return (
    <Box className={classes.tableContainer}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th miw={200}>Recipe</Table.Th>
            <Table.Th>Portions</Table.Th>
            <Table.Th>
              <TableHeader unitInSameRow text="Quantity" unit="(g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader unitInSameRow text="Kcal" />
            </Table.Th>
            <Table.Th>
              <TableHeader unitInSameRow text="Protein" unit="(g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader unitInSameRow text="Fat" unit="(g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader unitInSameRow text="Saturated" unit="(g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader unitInSameRow text="Carbs" unit="(g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader unitInSameRow text="Sugar" unit="(g)" />
            </Table.Th>
            <Table.Th>
              <TableHeader unitInSameRow text="Salt" unit="(g)" />
            </Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows.length === 0 ? emptyRow : rows}</Table.Tbody>
      </Table>
    </Box>
  )
}
