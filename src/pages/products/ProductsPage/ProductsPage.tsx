import { Box, Button, Title } from '@mantine/core'
import { IconExternalLink, IconPlus } from '@tabler/icons-react'
import { GrayText } from 'src/components/GrayText'
import { Link } from 'src/components/Link'
import { PageTemplate } from 'src/components/PageTemplate'
import {
  useGetAllCustomProducts,
  useGetAllExternalProducts,
} from 'src/hooks/useDatabase'
import { ProductsTable } from 'src/pages/products/ProductsPage/components/ProductsTable'
import { routes } from 'src/routes'

export function ProductsPage() {
  return (
    <PageTemplate
      title="Products"
      titleRightSection={
        <Link to={routes.products.add.path}>
          <Button leftSection={<IconPlus size={14} />}>Add product</Button>
        </Link>
      }
      description={
        <>
          {' '}
          Product search is powered by{' '}
          <a
            href="https://world.openfoodfacts.org/"
            target="_blank"
            rel="noreferrer"
          >
            Open Food Facts{' '}
            <IconExternalLink
              size={16}
              style={{ position: 'relative', top: '2px' }}
            />
          </a>{' '}
          project. In addition, you can add custom products in this page.
        </>
      }
    >
      <Box>
        <Title order={2} size="h3" mt="md">
          Custom products
        </Title>
        <GrayText py="sm">
          Products added automatically by Biceps app or manually by you
        </GrayText>
        <ProductsTable useData={useGetAllCustomProducts} showRemove />

        <Title order={2} size="h3" mt={80}>
          Open Food Facts
        </Title>
        <GrayText py="sm">Products added from Open Food Facts</GrayText>
        <ProductsTable useData={useGetAllExternalProducts} showRemove />
      </Box>
    </PageTemplate>
  )
}
