import {
  Combobox,
  Flex,
  Loader,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useDebounce } from '@uidotdev/usehooks'
import { useCallback, useEffect, useState } from 'react'
import { ProductImage } from 'src/components/ProductImage'
import { useCustomProductSearch } from 'src/hooks/useDatabase'
import { useSearch } from 'src/hooks/useFoodApi'
import { useNotifications } from 'src/hooks/useNotification'
import { Product } from 'src/utils/foodApi'

type Props = {
  onProductSelect: (product: Product) => void
}

export function ProductSearch({ onProductSelect }: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const { notification } = useNotifications()
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 300)
  const searchResult = useSearch({ searchTerms: debouncedValue })
  const customSearchResult = useCustomProductSearch({
    searchTerms: debouncedValue,
  })
  const products = searchResult.data?.products ?? []

  useEffect(() => {
    if (!searchResult.error) return

    notification({
      message: `Search failed: ${searchResult.error?.message ?? 'unknown error'}`,
      color: 'red',
    })
  }, [searchResult.error, notification])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value)
    combobox.resetSelectedOption()
    combobox.openDropdown()
  }

  const onProductClick = useCallback(
    (product: Product) => {
      onProductSelect(product)
      setValue('')
    },
    [onProductSelect, setValue]
  )

  const options = products.map((product) => (
    <Combobox.Option
      value={product.id}
      key={product.id}
      onClick={onProductClick.bind(null, product)}
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

  return (
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
          aria-label="Search products"
          placeholder="Search products"
          value={value}
          onChange={handleChange}
          onClick={() => combobox.openDropdown()}
          onFocus={() => {
            combobox.openDropdown()
          }}
          onBlur={() => combobox.closeDropdown()}
          rightSection={
            searchResult.isLoading || customSearchResult.isLoading ? (
              <Loader size={18} />
            ) : (
              <IconSearch width={18} />
            )
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown
        hidden={
          (searchResult.isLoading || searchResult.isPending) &&
          (customSearchResult.isLoading || customSearchResult.isPending)
        }
      >
        <Combobox.Options mah={280} style={{ overflowY: 'auto' }}>
          {options}
          {products.length === 0 ? (
            <Combobox.Empty>No products found</Combobox.Empty>
          ) : null}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
