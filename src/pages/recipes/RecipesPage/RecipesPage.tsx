import { Button, Flex, Switch } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'src/components/Link'
import { PageTemplate } from 'src/components/PageTemplate'
import { RecipesTable } from 'src/pages/recipes/RecipesPage/components/RecipesTable'
import { routes } from 'src/routes'

export function RecipesPage() {
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

      <RecipesTable amountsPerPortion={amountsPerPortion} showRemove />
    </PageTemplate>
  )
}
