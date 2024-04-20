import { BoxProps, Flex, Table, Text } from '@mantine/core'
import { ItemImage } from 'src/components/ItemImage'
import { RecipeItemResolvedBeforeSaving } from 'src/db/schemas/RecipeItemSchema'
import { RecipeResolved } from 'src/db/schemas/RecipeSchema'
import { formatRoute, routes } from 'src/routes'
import { formatGrams, formatKcal } from 'src/utils/format'
import { Link } from 'wouter'

type Props = {
  recipes: RecipeResolved[]
  onRemove: (index: number) => void
}

export function RecipesTable({ recipes }: Props) {
  const rows = recipes.map((recipe, index) => {
    const values = calculateTotals(recipe.recipeItems)
    return (
      <Table.Tr key={index}>
        <Table.Td>
          <Flex align="center" gap="sm">
            <ItemImage item={recipe.recipeItems[0]?.item} />
            <Link to={formatRoute(routes.recipes.edit.path, { id: recipe.id })}>
              <Text>{recipe.name}</Text>
            </Link>
          </Flex>
        </Table.Td>
        <Table.Td>{formatGrams(values.weightGrams)}</Table.Td>
        <Table.Td>{formatKcal(values.kcal)}</Table.Td>
        <Table.Td>{formatGrams(values.protein)}</Table.Td>
        <Table.Td>{formatGrams(values.fatTotal)}</Table.Td>
        <Table.Td>{formatGrams(values.fatSaturated)}</Table.Td>
        <Table.Td>{formatGrams(values.carbsTotal)}</Table.Td>
        <Table.Td>{formatGrams(values.carbsSugar)}</Table.Td>
        <Table.Td>{formatGrams(values.salt)}</Table.Td>
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
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  )
}

function calculateNutrition(weightGrams: number, valuePer100Grams: number) {
  return valuePer100Grams * (weightGrams / 100)
}

function calculateTotals(recipeItems: RecipeItemResolvedBeforeSaving[]) {
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

function calculateValuesForItem(recipeItem: RecipeItemResolvedBeforeSaving) {
  const { weightGrams, item } = recipeItem
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
