import { CommonResolverOptions } from 'src/db/resolvers/types'
import { AppStateResolved, AppStateRow } from 'src/db/schemas/AppState'
import { ItemResolved, ItemRow } from 'src/db/schemas/ItemSchema'
import { PersonResolved, PersonRow } from 'src/db/schemas/PersonSchema'
import { RecipeResolved, RecipeRow } from 'src/db/schemas/RecipeSchema'

export const resolvers = {
  Recipe: recipeResolver,
  AppState: appStateResolver,
  Person: personResolver,
  Item: itemResolver,
}

export async function recipeResolver({
  row,
  loaders,
  connection,
}: {
  row: RecipeRow
} & CommonResolverOptions): Promise<RecipeResolved> {
  const itemRows = await loaders.itemsByRecipeIds.load(row.id)
  const recipe = {
    ...row,
    items: await Promise.all(
      itemRows.map((row) => itemResolver({ row, loaders, connection }))
    ),
  }
  return recipe
}

export async function itemResolver({
  row,
}: {
  row: ItemRow
} & CommonResolverOptions): Promise<ItemResolved> {
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
  return {
    ...row,
    selectedPerson: await personResolver({
      row: selectedPersonRow,
      loaders,
      connection,
    }),
  }
}

export async function personResolver({
  row,
}: {
  row: PersonRow
} & CommonResolverOptions): Promise<PersonResolved> {
  const [first, second] = row.name.split(' ')
  return { ...row, initials: `${first[0]}${second[0]}`.toLocaleUpperCase() }
}
