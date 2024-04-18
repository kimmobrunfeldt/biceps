import { Avatar, Flex, Table, Text } from '@mantine/core'
import { RecipeItemResolvedBeforeSaving } from 'src/db/schemas/RecipeItemSchema'

type Props = {
  recipeItems: RecipeItemResolvedBeforeSaving[]
  onRemove: (index: number) => void
}

export function RecipeItemsTable({ recipeItems }: Props) {
  const rows = recipeItems.map((recipeItem) => {
    const { item, weightGrams } = recipeItem
    return (
      <Table.Tr key={item.name}>
        <Table.Td>
          <Flex align="center" gap="sm">
            <Avatar
              src={item.imageThumbUrl ?? null}
              alt=""
              size="md"
              radius="sm"
            />
            <Text>{item.name}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>{weightGrams}g</Table.Td>
        <Table.Td>{calculateTotal(weightGrams, item.kcal)}</Table.Td>
        <Table.Td>{calculateTotal(weightGrams, item.protein)}</Table.Td>
        <Table.Td>{calculateTotal(weightGrams, item.fatTotal)}</Table.Td>
        <Table.Td>{calculateTotal(weightGrams, item.fatSaturated)}</Table.Td>
        <Table.Td>{calculateTotal(weightGrams, item.carbsTotal)}</Table.Td>
        <Table.Td>{calculateTotal(weightGrams, item.carbsSugar)}</Table.Td>
        <Table.Td>{calculateTotal(weightGrams, item.salt)}</Table.Td>
      </Table.Tr>
    )
  })

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Item</Table.Th>
          <Table.Th>Quantity</Table.Th>
          <Table.Th>Kcal</Table.Th>
          <Table.Th>Protein</Table.Th>
          <Table.Th>Fat</Table.Th>
          <Table.Th>Saturated fat</Table.Th>
          <Table.Th>Carbs</Table.Th>
          <Table.Th>Sugar</Table.Th>
          <Table.Th>Salt</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  )
}

function calculateTotal(weightGrams: number, valuePer100Grams: number) {
  return valuePer100Grams * (weightGrams / 100)
}
