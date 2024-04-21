import { Blockquote, Button, Text } from '@mantine/core'
import { IconExternalLink, IconPlus } from '@tabler/icons-react'
import { PageTemplate } from 'src/components/PageTemplate'
import { PaperContainer } from 'src/components/PaperContainer'
import { Query } from 'src/components/Query'
import { useGetAllRecipes } from 'src/hooks/useDatabase'
import { RecipesTable } from 'src/pages/recipes/RecipesPage/components/RecipesTable'
import { routes } from 'src/routes'
import { Link } from 'wouter'

export function RecipesPage() {
  const recipesResult = useGetAllRecipes()

  return (
    <PageTemplate
      title="Recipes"
      titleRightSection={
        <Link to={routes.recipes.add.path}>
          <Button leftSection={<IconPlus size={14} />}>Add recipe</Button>
        </Link>
      }
    >
      <Blockquote my="lg" maw={900} p="lg">
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

      <PaperContainer>
        <Query result={recipesResult}>
          {(recipes) => {
            return <RecipesTable recipes={recipes} onRemove={() => undefined} />
          }}
        </Query>
      </PaperContainer>
    </PageTemplate>
  )
}
