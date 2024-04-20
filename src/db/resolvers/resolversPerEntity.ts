import { CommonResolverOptions } from 'src/db/resolvers/types'
import { AppStateResolved, AppStateRow } from 'src/db/schemas/AppState'
import { PersonResolved, PersonRow } from 'src/db/schemas/PersonSchema'
import { ProductResolved, ProductRow } from 'src/db/schemas/ProductSchema'
import {
  RecipeItemResolved,
  RecipeItemRow,
} from 'src/db/schemas/RecipeItemSchema'
import { RecipeResolved, RecipeRow } from 'src/db/schemas/RecipeSchema'

export const resolvers = {
  Recipe: recipeResolver,
  AppState: appStateResolver,
  Person: personResolver,
  Product: productResolver,
  RecipeItem: recipeItemResolver,
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
