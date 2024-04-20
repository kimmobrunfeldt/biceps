import { Blockquote, Box, Button, Flex, Text, Title } from '@mantine/core'
import { IconInfoCircle, IconPlus } from '@tabler/icons-react'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import {
  useGetAllCustomProducts,
  useGetAllExternalProducts,
} from 'src/hooks/useDatabase'
import { ProductsTable } from 'src/pages/ProductsPage/components/ProductsTable'

export function ProductsPage() {
  const customProductsResult = useGetAllCustomProducts()
  const externalProductsResult = useGetAllExternalProducts()

  return (
    <PageTemplate
      title="Products"
      titleRightSection={
        <Button leftSection={<IconPlus size={14} />}>Add product</Button>
      }
    >
      <Box>
        <Blockquote my="lg" maw={900}>
          <Text>
            Product search is powered by{' '}
            <a
              href="https://world.openfoodfacts.org/"
              target="_blank"
              rel="noreferrer"
            >
              Open Food Facts
            </a>{' '}
            project. In addition, you can add custom products in this page.
          </Text>
        </Blockquote>

        <Title order={2} size="md" mt="xl">
          Custom products
        </Title>
        <Text py="md" c="gray" opacity={0.7}>
          Products added automatically by Biceps app or manually by you.
        </Text>
        <Query result={customProductsResult} whenEmpty={() => <NoProducts />}>
          {(products) => {
            return <ProductsTable products={products} />
          }}
        </Query>

        <Title order={2} size="md" mt={100}>
          Open Food Facts
        </Title>
        <Text py="md" c="gray" opacity={0.7}>
          Products added from Open Food Facts
        </Text>
        <Query result={externalProductsResult} whenEmpty={() => <NoProducts />}>
          {(products) => {
            return <ProductsTable products={products} />
          }}
        </Query>
      </Box>
    </PageTemplate>
  )
}

const NoProducts = () => {
  return (
    <Box>
      <ProductsTable products={[]} />
      <Flex
        py="md"
        px="sm"
        direction="row"
        align="center"
        gap={4}
        opacity={0.7}
      >
        <IconInfoCircle width={20} color="gray" />
        <Text c="gray">No products found</Text>
      </Flex>
    </Box>
  )
}
