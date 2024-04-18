import { Box, Flex, Text } from '@mantine/core'
import convert, { Unit } from 'convert'
import { RecipeItemResolvedBeforeSaving } from 'src/db/schemas/RecipeItemSchema'
import { RecipeItemsTable } from 'src/pages/AddRecipePage/components/ProductItemsTable'
import { ProductSearch } from 'src/pages/AddRecipePage/components/ProductSearch'
import { Product } from 'src/utils/foodApi'

type Props = {
  onChange: (recipeItems: RecipeItemResolvedBeforeSaving[]) => void
  recipeItems: RecipeItemResolvedBeforeSaving[]
}

export function RecipeItems({ recipeItems, onChange }: Props) {
  return (
    <Flex py="xl" direction="column">
      <Box w="100%" maw={380} style={{ alignSelf: 'flex-end' }} mb="md">
        <ProductSearch
          onProductSelect={(p) => onChange([...recipeItems, productToItem(p)])}
        />
      </Box>

      <Box>
        <RecipeItemsTable recipeItems={recipeItems} onRemove={() => {}} />
        {recipeItems.length === 0 ? (
          <Text py="md" px="sm" c="gray" opacity={0.7}>
            No recipe items added
          </Text>
        ) : null}
      </Box>
    </Flex>
  )
}

function productToItem(product: Product): RecipeItemResolvedBeforeSaving {
  return {
    weightGrams: toGrams(
      product.product_quantity,
      product.product_quantity_unit ?? 'g'
    ),
    item: {
      name: product.product_name,
      kcal: product.nutriments['energy-kcal_100g'],
      fatTotal: product.nutriments.fat_100g,
      fatSaturated: product.nutriments['saturated-fat_100g'],
      carbsTotal: product.nutriments.carbohydrates_100g,
      carbsSugar: product.nutriments.sugars_100g,
      protein: product.nutriments.proteins_100g,
      salt: product.nutriments.salt_100g,
      imageThumbUrl: product.image_thumb_url,
      imageUrl: product.image_url,
    },
  }
}

function toGrams(quantity: number, unit: string) {
  try {
    return convert(quantity, unit as Unit).to('g')
  } catch (err) {
    return 0
  }
}
