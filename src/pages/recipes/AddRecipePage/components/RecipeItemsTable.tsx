import {
  ActionIcon,
  Box,
  Flex,
  NumberInput,
  Table,
  Text,
  Tooltip,
} from '@mantine/core'
import { IconInfoCircle, IconX } from '@tabler/icons-react'
import _ from 'lodash'
import { ProductImage } from 'src/components/ProductImage'
import classes from 'src/components/Table.module.css'
import { TableHeader } from 'src/components/TableHeader'
import { RecipeItemResolvedBeforeSaving } from 'src/db/schemas/RecipeItemSchema'
import { formatGrams, formatKcal } from 'src/utils/format'

type Props = {
  recipeItems: RecipeItemResolvedBeforeSaving[]
  editable?: boolean
  onRecipeItemRemove?: (index: number) => void
  onRecipeItemChange?: (
    index: number,
    value: Partial<RecipeItemResolvedBeforeSaving>
  ) => void
}

export function RecipeItemsTable({
  recipeItems,
  editable = false,
  onRecipeItemChange,
  onRecipeItemRemove,
}: Props) {
  function onItemRemoveClick(index: number) {
    onRecipeItemRemove?.(index)
  }

  function onItemChange(
    index: number,
    value: Partial<RecipeItemResolvedBeforeSaving>
  ) {
    onRecipeItemChange?.(index, value)
  }

  const totals = calculateTotals(recipeItems)
  const allRows = recipeItems.length > 0 ? [...recipeItems, totals] : []
  const rows = allRows.map((row, index) => {
    const hasItem = 'product' in row
    const name = hasItem ? row.product.name : 'Total'
    const values = hasItem ? calculateValuesForItem(row) : row

    return (
      <Table.Tr key={index} opacity={hasItem ? 1 : 0.7}>
        <Table.Td>
          <Flex align="center" gap="sm">
            {hasItem ? <ProductImage product={row.product} /> : null}
            <Text>{name}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>
          {editable && hasItem ? (
            <NumberInput
              allowNegative={false}
              decimalScale={1}
              defaultValue={values.weightGrams}
              onChange={(value) =>
                onItemChange(index, { weightGrams: Number(value) })
              }
              maw={100}
            />
          ) : (
            <Box pl="sm">{formatGrams(values.weightGrams)}</Box>
          )}
        </Table.Td>
        <Table.Td>{formatKcal(values.kcal)}</Table.Td>
        <Table.Td>{formatGrams(values.protein)}</Table.Td>
        <Table.Td>{formatGrams(values.fatTotal)}</Table.Td>
        <Table.Td>{formatGrams(values.fatSaturated)}</Table.Td>
        <Table.Td>{formatGrams(values.carbsTotal)}</Table.Td>
        <Table.Td>{formatGrams(values.carbsSugar)}</Table.Td>
        <Table.Td>{formatGrams(values.salt)}</Table.Td>
        <Table.Td>
          {editable && hasItem ? (
            <Tooltip label="Remove item">
              <ActionIcon
                variant="light"
                aria-label="Remove"
                radius="lg"
                size="sm"
                color="red"
                onClick={onItemRemoveClick.bind(null, index)}
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
      <Table.Td miw={290}>
        <Flex direction="row" align="center" gap={8} opacity={0.7} py="sm">
          <IconInfoCircle width={20} color="gray" />
          <Text c="gray">Add items by searching products</Text>
        </Flex>
      </Table.Td>
    </Table.Tr>
  )

  return (
    <Box className={classes.tableContainer}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th miw={200}>Item</Table.Th>
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
        <Table.Tbody>{rows.length > 0 ? rows : emptyRow}</Table.Tbody>
      </Table>
    </Box>
  )
}

export function calculateNutrition(
  weightGrams: number,
  valuePer100Grams: number
) {
  return valuePer100Grams * (weightGrams / 100)
}

export function calculateTotals(
  recipeItems: RecipeItemResolvedBeforeSaving[],
  {
    amountsPerPortion = true,
    portions = 1,
  }: { amountsPerPortion?: boolean; portions?: number } = {}
) {
  const totals = recipeItems.reduce(
    (acc, recipeItem) => {
      const values = calculateValuesForItem(recipeItem)
      return {
        weightGrams: acc.weightGrams + values.weightGrams,
        kcal: acc.kcal + values.kcal,
        protein: acc.protein + values.protein,
        fatTotal: acc.fatTotal + values.fatTotal,
        fatSaturated: acc.fatSaturated + values.fatSaturated,
        carbsTotal: acc.carbsTotal + values.carbsTotal,
        carbsSugar: acc.carbsSugar + values.carbsSugar,
        salt: acc.salt + values.salt,
      }
    },
    {
      weightGrams: 0,
      kcal: 0,
      protein: 0,
      fatTotal: 0,
      fatSaturated: 0,
      carbsTotal: 0,
      carbsSugar: 0,
      salt: 0,
    }
  )
  const divisor = amountsPerPortion ? portions : 1
  return _.mapValues(totals, (val) => val / divisor)
}

export function calculateValuesForItem(
  recipeItem: RecipeItemResolvedBeforeSaving
) {
  const { weightGrams, product: item } = recipeItem
  return {
    weightGrams,
    kcal: calculateNutrition(weightGrams, item.kcal),
    protein: calculateNutrition(weightGrams, item.protein),
    fatTotal: calculateNutrition(weightGrams, item.fatTotal),
    fatSaturated: calculateNutrition(weightGrams, item.fatSaturated),
    carbsTotal: calculateNutrition(weightGrams, item.carbsTotal),
    carbsSugar: calculateNutrition(weightGrams, item.carbsSugar),
    salt: calculateNutrition(weightGrams, item.salt),
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createNewRecipeItem() {
  return {
    weightGrams: 0,
    item: {
      name: '',
      kcal: 0,
      fatTotal: 0,
      fatSaturated: 0,
      carbsTotal: 0,
      carbsSugar: 0,
      protein: 0,
      salt: 0,
    },
  }
}
