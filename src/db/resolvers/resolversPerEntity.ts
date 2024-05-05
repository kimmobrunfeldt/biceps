import { RecurringEvent } from 'src/db/entities'
import { CommonResolverOptions } from 'src/db/resolvers/types'
import { AppStateResolved, AppStateRow } from 'src/db/schemas/AppStateSchema'
import { PersonResolved, PersonRow } from 'src/db/schemas/PersonSchema'
import { ProductResolved, ProductRow } from 'src/db/schemas/ProductSchema'
import {
  RecipeItemResolved,
  RecipeItemRow,
} from 'src/db/schemas/RecipeItemSchema'
import { RecipeResolved, RecipeRow } from 'src/db/schemas/RecipeSchema'
import {
  RecurringEventResolved,
  RecurringEventRow,
} from 'src/db/schemas/RecurringEventSchema'

export const resolvers = {
  Recipe: recipeResolver,
  AppState: appStateResolver,
  Person: personResolver,
  Product: productResolver,
  RecipeItem: recipeItemResolver,
  RecurringEvent: recurringEventResolver,
}

export async function recipeResolver({
  row,
  loaders,
  connection,
}: {
  row: RecipeRow
} & CommonResolverOptions): Promise<RecipeResolved> {
  const itemRows = await loaders.recipeItemsByRecipeIds.load(row.id)
  const recipe = {
    ...row,
    recipeItems: await Promise.all(
      itemRows.map((row) => recipeItemResolver({ row, loaders, connection }))
    ),
  }
  return recipe
}

export async function recipeItemResolver({
  row,
  loaders,
  connection,
}: {
  row: RecipeItemRow
} & CommonResolverOptions): Promise<RecipeItemResolved> {
  const productRow = await loaders.productsById.load(row.productId)
  return {
    ...row,
    product: await productResolver({
      row: productRow,
      loaders,
      connection,
    }),
  }
}

export async function productResolver({
  row,
}: {
  row: ProductRow
} & CommonResolverOptions): Promise<ProductResolved> {
  return row
}

export async function appStateResolver({
  row,
  loaders,
  connection,
}: {
  row: AppStateRow
} & CommonResolverOptions): Promise<AppStateResolved> {
  const selectedPersonRow = await loaders.personById.load(row.selectedPersonId)

  // TODO: Use data loader
  const recipeCount = await loaders.recipeTotalCount.load({})
  const { count: recurringEventsCount } = await RecurringEvent.count({
    connection,
    limit: 1, // We are only interested if there are more than 0
  })

  const selectedPerson = await personResolver({
    row: selectedPersonRow,
    loaders,
    connection,
  })

  function getOnboardingState(): AppStateResolved['onboardingState'] {
    if (row.onboardingCompletedAt) {
      return 'Completed'
    }

    const personOnboarded =
      selectedPerson && selectedPerson.name && selectedPerson.name.length > 0

    if (personOnboarded && recipeCount > 0 && recurringEventsCount > 0) {
      return 'WeeklyScheduleAdded'
    } else if (personOnboarded && recipeCount > 0) {
      return 'RecipeAdded'
    } else if (personOnboarded && recipeCount === 0) {
      return 'ProfileCreated'
    }

    return 'NewUser'
  }

  return {
    ...row,
    onboardingState: getOnboardingState(),
    selectedPerson,
  }
}

export async function personResolver({
  row,
}: {
  row: PersonRow
} & CommonResolverOptions): Promise<PersonResolved> {
  const [first, second] = row.name.split(' ')
  return {
    ...row,
    initials: `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toLocaleUpperCase(),
  }
}

export async function recurringEventResolver({
  row,
  loaders,
  connection,
}: {
  row: RecurringEventRow
} & CommonResolverOptions): Promise<RecurringEventResolved> {
  const { hour, minute, ...rest } = row
  const common = {
    ...rest,
    time: {
      hour,
      minute,
    },
  }

  switch (common.eventType) {
    case 'EatRecipe': {
      const recipeRow = await loaders.recipesById.load(common.recipeToEatId)
      return {
        ...common,
        recipeToEat: await recipeResolver({
          row: recipeRow,
          loaders,
          connection,
        }),
      }
    }

    case 'EatProduct': {
      const productRow = await loaders.productsById.load(common.productToEatId)
      return {
        ...common,
        productToEat: await productResolver({
          row: productRow,
          loaders,
          connection,
        }),
      }
    }
  }
}
