import {
  Avatar,
  Combobox,
  Flex,
  Loader,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useDebounce } from '@uidotdev/usehooks'
import { useCallback, useState } from 'react'
import { useSearch } from 'src/hooks/useFoodApi'
import { Product } from 'src/utils/foodApi'

type Props = {
  onProductSelect: (product: Product) => void
}

export function ProductSearch({ onProductSelect }: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 300)
  const searchResult = useSearch({ searchTerms: debouncedValue })
  const products = searchResult.data?.products ?? []

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
        <Avatar
          src={product.image_thumb_url}
          alt={product.product_name}
          size="md"
          radius="sm"
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
            searchResult.isLoading ? (
              <Loader size={18} />
            ) : (
              <IconSearch width={18} />
            )
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown
        hidden={searchResult.isLoading || searchResult.isPending}
      >
        <Combobox.Options>
          {options}
          {products.length === 0 ? (
            <Combobox.Empty>No products found</Combobox.Empty>
          ) : null}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
