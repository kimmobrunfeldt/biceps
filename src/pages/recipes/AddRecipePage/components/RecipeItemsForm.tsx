import { Box, Flex, Paper, Text } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import convert, { Unit } from 'convert'
import {
  Control,
  UseFormSetValue,
  useFieldArray,
  useWatch,
} from 'react-hook-form'
import { RecipeItemResolvedBeforeSaving } from 'src/db/schemas/RecipeItemSchema'
import { ProductSearch } from 'src/pages/recipes/AddRecipePage/components/ProductSearch'
import { RecipeFormFields } from 'src/pages/recipes/AddRecipePage/components/RecipeForm'
import { RecipeItemsTable } from 'src/pages/recipes/AddRecipePage/components/RecipeItemsTable'
import { Product } from 'src/utils/foodApi'
import classes from './RecipeItemsForm.module.css'

type Props = {
  control: Control<RecipeFormFields>
  setValue: UseFormSetValue<RecipeFormFields>
}

export function RecipeItemsForm({ control, setValue }: Props) {
  const { append, remove, fields } = useFieldArray({
    control,
    name: 'recipeItems',
    keyName: '__reactHookFormId',
  })

  const recipeItems = useWatch({ control, name: 'recipeItems' })

  function onRecipeItemChange(
    index: number,
    value: Partial<RecipeItemResolvedBeforeSaving>
  ) {
    setValue(`recipeItems.${index}`, {
      ...fields[index],
      ...value,
    })
  }

  return (
    <Flex py="xl" direction="column">
      <Box w="100%" maw={380} style={{ alignSelf: 'flex-end' }} mb="sm">
        <ProductSearch onProductSelect={(p) => append(productToItem(p))} />
      </Box>

      <Paper px="md" py="lg" radius="md" className={classes.table}>
        <RecipeItemsTable
          recipeItems={recipeItems}
          editable
          onRecipeItemRemove={remove}
          onRecipeItemChange={onRecipeItemChange}
        />
        {fields.length === 0 ? (
          <Flex
            py="md"
            px="sm"
            direction="row"
            align="center"
            gap={4}
            opacity={0.7}
          >
            <IconInfoCircle width={20} color="gray" />
            <Text c="gray">Add items by searching products</Text>
          </Flex>
        ) : null}
      </Paper>
    </Flex>
  )
}

function productToItem(product: Product): RecipeItemResolvedBeforeSaving {
  return {
    __type: 'RecipeItem',
    weightGrams: toGrams(
      product.product_quantity,
      product.product_quantity_unit ?? 'g'
    ),
    product: {
      __type: 'Product',
      id: product.id,
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
