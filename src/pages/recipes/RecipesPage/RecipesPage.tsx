import { Button, Flex, Switch } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'src/components/Link'
import { PageTemplate } from 'src/components/PageTemplate'
import { PaperContainer } from 'src/components/PaperContainer'
import { Query } from 'src/components/Query'
import { TableSkeleton } from 'src/components/TableSkeleton'
import { useGetAllRecipes } from 'src/hooks/useDatabase'
import { RecipesTable } from 'src/pages/recipes/RecipesPage/components/RecipesTable'
import { routes } from 'src/routes'

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
      description={
        <>
          Recipe can be a snack, single meal, or food prepping batch that serves
          multiple meals.
        </>
      }
    >
      <Flex justify="flex-end" pb="sm" px={4}>
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
