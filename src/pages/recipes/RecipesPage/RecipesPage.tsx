import { Blockquote, Button, Flex, Switch, Text } from '@mantine/core'
import { IconExternalLink, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { PaperContainer } from 'src/components/PaperContainer'
import { Query } from 'src/components/Query'
import { TableSkeleton } from 'src/components/TableSkeleton'
import { useGetAllRecipes } from 'src/hooks/useDatabase'
import { RecipesTable } from 'src/pages/recipes/RecipesPage/components/RecipesTable'
import { routes } from 'src/routes'
import { Link } from 'wouter'

export function RecipesPage() {
  const recipesResult = useGetAllRecipes()
  const [amountsPerPortion, setAmountsPerPortion] = useState(true)

  return (
    <PageTemplate
      title="Recipes"
      titleRightSection={
        <Link to={routes.recipes.add.path}>
          <Button leftSection={<IconPlus size={14} />}>Add recipe</Button>
        </Link>
      }
    >
      <Blockquote my="lg" maw={900} p="lg" radius="md">
        <Text c="gray">
          Recipe can be a snack, single meal, or food prepping batch that serves
          multiple meals. Product search is powered by{' '}
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
          project. In addition, you can add your own products in{' '}
          <Link to={routes.products.index.path}>Products</Link> page.
        </Text>
      </Blockquote>

      <Flex justify="flex-end" py="sm" px={4}>
        <Switch
          label="Amounts per portion"
          checked={amountsPerPortion}
          onChange={(event) =>
            setAmountsPerPortion(event.currentTarget.checked)
          }
          labelPosition="left"
        />
      </Flex>

      <PaperContainer>
        <Query result={recipesResult} whenLoading={<TableSkeleton />}>
          {(recipes) => {
            return (
              <RecipesTable
                recipes={recipes}
                onRemove={() => undefined}
                amountsPerPortion={amountsPerPortion}
              />
            )
          }}
        </Query>
      </PaperContainer>
    </PageTemplate>
  )
}
