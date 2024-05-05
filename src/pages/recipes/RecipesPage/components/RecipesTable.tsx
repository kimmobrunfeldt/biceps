import { Box, Flex, Table, Text } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { Link } from 'src/components/Link'
import { NutritionCircle } from 'src/components/NutritionCircle'
import classes from 'src/components/Table.module.css'
import { TableHeader } from 'src/components/TableHeader'
import { RecipeResolved } from 'src/db/schemas/RecipeSchema'
import { calculateTotals } from 'src/pages/recipes/AddRecipePage/components/RecipeItemsTable'
import { formatRoute, routes } from 'src/routes'
import { formatGrams, formatKcal } from 'src/utils/format'

type Props = {
  recipes: RecipeResolved[]
  amountsPerPortion?: boolean
}

export function RecipesTable({ recipes, amountsPerPortion = true }: Props) {
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
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows.length === 0 ? emptyRow : rows}</Table.Tbody>
      </Table>
    </Box>
  )
}
