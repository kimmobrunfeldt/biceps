import { Box, Button, Flex, Title } from '@mantine/core'
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
        <Flex direction="column" align="center" gap={6}>
          <Link to={routes.products.add.path}>
            <Button leftSection={<IconPlus size={14} />}>Add product</Button>
          </Link>
          <Box fz="sm">
            or <Link to={routes.products.import.path}>import products</Link>
          </Box>
        </Flex>
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
        <GrayText py="sm" maw={650}>
          Products added manually by you.
        </GrayText>
        <ProductsTable useData={useGetAllCustomProducts} showRemove />

        <Title order={2} size="h3" mt={80}>
          External products
        </Title>
        <GrayText py="sm" maw={650}>
          Products added from Open Food Facts via product search or
          automatically by Biceps app during initialization. Initially added
          data is provided by Finnish Institute of Health and Welfare, Fineli.
        </GrayText>
        <ProductsTable useData={useGetAllExternalProducts} showRemove />
      </Box>
    </PageTemplate>
  )
}
