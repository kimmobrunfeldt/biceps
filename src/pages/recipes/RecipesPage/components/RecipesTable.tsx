import { BoxProps, Flex, Table, Text } from '@mantine/core'
import { NutritionCircle } from 'src/components/NutritionCircle'
import { ProductImage } from 'src/components/ProductImage'
import { RecipeResolved } from 'src/db/schemas/RecipeSchema'
import { calculateTotals } from 'src/pages/recipes/AddRecipePage/components/RecipeItemsTable'
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
            <Flex gap={4}>
              <NutritionCircle
                nutrition={values}
                variant="icon"
                weightGrams={values.weightGrams}
              />
              <ProductImage product={recipe.recipeItems[0]?.product} />
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
      </Table.Tr>
    )
  })

  const style: BoxProps['style'] = {
    whiteSpace: 'nowrap',
  }
  return (
    <Table.ScrollContainer minWidth={360} w="100%">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th miw={200}>Item</Table.Th>
            <Table.Th style={style}>Portions</Table.Th>
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
    </Table.ScrollContainer>
  )
}
