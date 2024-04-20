import { Blockquote, Box, Button, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { useGetAllRecipes } from 'src/hooks/useDatabase'
import { RecipesTable } from 'src/pages/RecipesPage/components/RecipesTable'
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
      <Blockquote my="lg" maw={900}>
        <Text c="gray">
          Recipes can be a single meal or food prepping batch that serves
          multiple meals. Product search is powered by{' '}
          <a
            href="https://world.openfoodfacts.org/"
            target="_blank"
            rel="noreferrer"
          >
            Open Food Facts
          </a>{' '}
          project. In addition, you can add your own products in Products page.
        </Text>
      </Blockquote>

      <Box>
        <Query result={recipesResult}>
          {(recipes) => {
            return <RecipesTable recipes={recipes} onRemove={() => undefined} />
          }}
        </Query>
      </Box>
    </PageTemplate>
  )
}
