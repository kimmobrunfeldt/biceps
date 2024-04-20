// Warning! This file was auto-generated with 'npm run generate'. Do not edit manually.

/* eslint-disable no-restricted-imports */

import { createEntity } from 'src/db/interface/entityInterface'

import {
  clientUpsert as clientUpsertAppState,
  find as findAppState,
  findMany as findManyAppState,
  insert as insertAppState,
  maybeFind as maybeFindAppState,
  remove as removeAppState,
  removeAll as removeAllAppState,
  update as updateAppState,
  upsert as upsertAppState,
} from 'src/db/entities/AppState'
const AppStateEntity = createEntity({
  clientUpsert: clientUpsertAppState,
  find: findAppState,
  findMany: findManyAppState,
  insert: insertAppState,
  maybeFind: maybeFindAppState,
  remove: removeAppState,
  removeAll: removeAllAppState,
  update: updateAppState,
  upsert: upsertAppState,
})
export { AppStateEntity as AppState }

import {
  clientUpsert as clientUpsertPerson,
  find as findPerson,
  findMany as findManyPerson,
  insert as insertPerson,
  maybeFind as maybeFindPerson,
  remove as removePerson,
  removeAll as removeAllPerson,
  update as updatePerson,
  upsert as upsertPerson,
} from 'src/db/entities/Person'
const PersonEntity = createEntity({
  clientUpsert: clientUpsertPerson,
  find: findPerson,
  findMany: findManyPerson,
  insert: insertPerson,
  maybeFind: maybeFindPerson,
  remove: removePerson,
  removeAll: removeAllPerson,
  update: updatePerson,
  upsert: upsertPerson,
})
export { PersonEntity as Person }

import {
  clientUpsert as clientUpsertPersonRecipe,
  find as findPersonRecipe,
  findMany as findManyPersonRecipe,
  insert as insertPersonRecipe,
  removeAll as removeAllPersonRecipe,
  upsert as upsertPersonRecipe,
} from 'src/db/entities/PersonRecipe'
const PersonRecipeEntity = createEntity({
  clientUpsert: clientUpsertPersonRecipe,
  find: findPersonRecipe,
  findMany: findManyPersonRecipe,
  insert: insertPersonRecipe,
  removeAll: removeAllPersonRecipe,
  upsert: upsertPersonRecipe,
})
export { PersonRecipeEntity as PersonRecipe }

import {
  findManyByRecipeIds as findManyByRecipeIdsProduct,
  findManyCustom as findManyCustomProduct,
  findManyExternal as findManyExternalProduct,
  clientUpsert as clientUpsertProduct,
  find as findProduct,
  findMany as findManyProduct,
  insert as insertProduct,
  remove as removeProduct,
  removeAll as removeAllProduct,
  update as updateProduct,
  upsert as upsertProduct,
} from 'src/db/entities/Product'
const ProductEntity = createEntity({
  findManyByRecipeIds: findManyByRecipeIdsProduct,
  findManyCustom: findManyCustomProduct,
  findManyExternal: findManyExternalProduct,
  clientUpsert: clientUpsertProduct,
  find: findProduct,
  findMany: findManyProduct,
  insert: insertProduct,
  remove: removeProduct,
  removeAll: removeAllProduct,
  update: updateProduct,
  upsert: upsertProduct,
})
export { ProductEntity as Product }

import {
  findManyByProductIds as findManyByProductIdsRecipe,
  clientUpsert as clientUpsertRecipe,
  find as findRecipe,
  findMany as findManyRecipe,
  insert as insertRecipe,
  maybeFind as maybeFindRecipe,
  remove as removeRecipe,
  removeAll as removeAllRecipe,
  update as updateRecipe,
  upsert as upsertRecipe,
} from 'src/db/entities/Recipe'
const RecipeEntity = createEntity({
  findManyByProductIds: findManyByProductIdsRecipe,
  clientUpsert: clientUpsertRecipe,
  find: findRecipe,
  findMany: findManyRecipe,
  insert: insertRecipe,
  maybeFind: maybeFindRecipe,
  remove: removeRecipe,
  removeAll: removeAllRecipe,
  update: updateRecipe,
  upsert: upsertRecipe,
})
export { RecipeEntity as Recipe }

import {
  findManyByRecipeIds as findManyByRecipeIdsRecipeItem,
  clientUpsert as clientUpsertRecipeItem,
  find as findRecipeItem,
  findMany as findManyRecipeItem,
  insert as insertRecipeItem,
  remove as removeRecipeItem,
  removeAll as removeAllRecipeItem,
  upsert as upsertRecipeItem,
} from 'src/db/entities/RecipeItem'
const RecipeItemEntity = createEntity({
  findManyByRecipeIds: findManyByRecipeIdsRecipeItem,
  clientUpsert: clientUpsertRecipeItem,
  find: findRecipeItem,
  findMany: findManyRecipeItem,
  insert: insertRecipeItem,
  remove: removeRecipeItem,
  removeAll: removeAllRecipeItem,
  upsert: upsertRecipeItem,
})
export { RecipeItemEntity as RecipeItem }

export const allEntities = {
  AppState: AppStateEntity,
  Person: PersonEntity,
  PersonRecipe: PersonRecipeEntity,
  Product: ProductEntity,
  Recipe: RecipeEntity,
  RecipeItem: RecipeItemEntity,
}
export type AnyDatabaseEntity = (typeof allEntities)[keyof typeof allEntities]
