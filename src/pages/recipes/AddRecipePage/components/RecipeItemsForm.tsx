import { Box, Flex } from '@mantine/core'
import {
  Control,
  UseFormSetValue,
  useFieldArray,
  useWatch,
} from 'react-hook-form'
import { PaperContainer } from 'src/components/PaperContainer'
import { RecipeItemResolvedBeforeSaving } from 'src/db/schemas/RecipeItemSchema'
import { ProductSearch } from 'src/pages/recipes/AddRecipePage/components/ProductSearch'
import { RecipeFormFields } from 'src/pages/recipes/AddRecipePage/components/RecipeForm'
import { RecipeItemsTable } from 'src/pages/recipes/AddRecipePage/components/RecipeItemsTable'

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

  const recipeItems = useWatch({
    control,
    name: 'recipeItems',
    defaultValue: fields,
  })

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
    <PaperContainer>
      <Flex direction="column">
        <Box w="100%" maw={380} mb="sm" style={{ alignSelf: 'flex-start' }}>
          <ProductSearch onSelect={(recipeItem) => append(recipeItem)} />
        </Box>

        <Box py="lg">
          <RecipeItemsTable
            recipeItems={recipeItems}
            editable
            onRecipeItemRemove={remove}
            onRecipeItemChange={onRecipeItemChange}
          />
        </Box>
      </Flex>
    </PaperContainer>
  )
}
