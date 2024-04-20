import {
  ActionIcon,
  Box,
  BoxProps,
  Flex,
  NumberInput,
  Table,
  Text,
  Tooltip,
} from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { ProductImage } from 'src/components/ProductImage'
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
    const hasItem = 'item' in row
    const name = hasItem ? row.product.name : 'Total'
    const values = hasItem ? calculateValuesForItem(row) : row

    return (
      <Table.Tr key={index} opacity={hasItem ? 1 : 0.7}>
        <Table.Td>
          <Flex align="center" gap="sm">
            <ProductImage
              product={hasItem ? row.product : undefined}
              style={{ opacity: hasItem ? 1 : 0 }}
            />
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

  const style: BoxProps['style'] = {
    whiteSpace: 'nowrap',
  }
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th miw={200}>Item</Table.Th>
          <Table.Th style={style}>Quantity (g)</Table.Th>
          <Table.Th style={style}>Kcal</Table.Th>
          <Table.Th style={style}>Protein (g)</Table.Th>
          <Table.Th style={style}>Fat (g)</Table.Th>
          <Table.Th>Saturated fat&nbsp;(g)</Table.Th>
          <Table.Th style={style}>Carbs (g)</Table.Th>
          <Table.Th style={style}>Sugar (g)</Table.Th>
          <Table.Th style={style}>Salt (g)</Table.Th>
          <Table.Th style={style}></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  )
}

export function calculateNutrition(
  weightGrams: number,
  valuePer100Grams: number
) {
  return valuePer100Grams * (weightGrams / 100)
}

export function calculateTotals(recipeItems: RecipeItemResolvedBeforeSaving[]) {
  return recipeItems.reduce(
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
