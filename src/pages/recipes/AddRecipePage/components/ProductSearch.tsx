import {
  Box,
  Combobox,
  Flex,
  Loader,
  Stack,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useDebounce } from '@uidotdev/usehooks'
import convert, { Unit } from 'convert'
import { useCallback, useState } from 'react'
import { ProductImage } from 'src/components/ProductImage'
import { RecipeItemResolvedBeforeSaving } from 'src/db/schemas/RecipeItemSchema'
import { useCustomProductSearch } from 'src/hooks/useDatabase'
import { useSearch } from 'src/hooks/useFoodApi'
import { Product } from 'src/utils/foodApi'

type Props = {
  onSelect: (recipeItem: RecipeItemResolvedBeforeSaving) => void
}

export function ProductSearch({ onSelect }: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 300)
  const dbSearchResult = useCustomProductSearch({
    searchTerms: debouncedValue,
  })
  const apiSearchResult = useSearch({ searchTerms: debouncedValue })
  const dbProducts = dbSearchResult.data ?? []
  const apiProducts = apiSearchResult.data?.products ?? []

  const errorMessage = getErrorMessage([
    apiSearchResult.error
      ? `Search failed: ${apiSearchResult.error?.message ?? 'unknown error'}`
      : undefined,
    dbSearchResult.error
      ? `Search failed: ${dbSearchResult.error?.message ?? 'unknown error'}`
      : undefined,
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value)
    combobox.resetSelectedOption()
    combobox.openDropdown()
  }

  const onOptionClick = useCallback(
    (recipeItem: RecipeItemResolvedBeforeSaving) => {
      onSelect(recipeItem)
      setValue('')
    },
    [onSelect, setValue]
  )

  const customOptions = dbProducts.map((product) => (
    <Combobox.Option
      value={product.id}
      key={product.id}
      onClick={onOptionClick.bind(null, {
        __type: 'RecipeItem',
        weightGrams: 100,
        product,
      })}
    >
      <Flex align="center" gap="sm">
        <ProductImage
          product={{
            imageUrl: product.imageUrl,
            imageThumbUrl: product.imageThumbUrl,
          }}
          alt={product.name}
        />

        <Text>{product.name}</Text>
      </Flex>
    </Combobox.Option>
  ))

  const apiOptions = apiProducts.map((product) => (
    <Combobox.Option
      value={product.id}
      key={product.id}
      onClick={onOptionClick.bind(null, productToItem(product))}
    >
      <Flex align="center" gap="sm">
        <ProductImage
          product={{
            imageUrl: product.image_url,
            imageThumbUrl: product.image_thumb_url,
          }}
          alt={product.product_name}
        />

        <Text>
          {product.product_name} {product.quantity}
        </Text>
      </Flex>
    </Combobox.Option>
  ))

  const isLoading =
    value.length > 0 &&
    (apiSearchResult.isLoading ||
      apiSearchResult.isPending ||
      dbSearchResult.isLoading ||
      dbSearchResult.isPending)
  return (
    <Stack gap="sm">
      <Combobox
        onOptionSubmit={(optionValue) => {
          setValue(optionValue)
          combobox.closeDropdown()
        }}
        withinPortal={false}
        store={combobox}
      >
        <Combobox.Target>
          <TextInput
            error={errorMessage ? true : false}
            aria-label="Search products"
            placeholder="Search products"
            value={value}
            onChange={handleChange}
            onFocus={() => {
              combobox.openDropdown()
            }}
            onBlur={() => combobox.closeDropdown()}
            rightSection={
              isLoading ? <Loader size={18} /> : <IconSearch width={18} />
            }
          />
        </Combobox.Target>

        <Combobox.Dropdown hidden={value.length === 0}>
          <Combobox.Group label="Custom products">
            <Combobox.Options mah={280} style={{ overflowY: 'auto' }}>
              {customOptions}
              {customOptions.length === 0 ? (
                <Combobox.Empty>
                  {value.length > 0 ? 'No products found' : 'Type to search'}
                </Combobox.Empty>
              ) : null}
            </Combobox.Options>
          </Combobox.Group>

          <Combobox.Group label="Open Food Facts">
            <Combobox.Options mah={280} style={{ overflowY: 'auto' }}>
              {apiOptions}
              {apiProducts.length === 0 ? (
                <Combobox.Empty>
                  {value.length > 0 ? 'No products found' : 'Type to search'}
                </Combobox.Empty>
              ) : null}
            </Combobox.Options>
          </Combobox.Group>
        </Combobox.Dropdown>
      </Combobox>
      <Box pl={4}>
        {errorMessage ? <Text c="red">{errorMessage}</Text> : null}
      </Box>
    </Stack>
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

function getErrorMessage(errorMessages: (string | undefined)[]) {
  return errorMessages.find((message) => message !== undefined)
}
