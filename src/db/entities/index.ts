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
const AppStateEntity = createEntity('AppState', {
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
const PersonEntity = createEntity('Person', {
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
  findManyByRecipeIds as findManyByRecipeIdsProduct,
  findManyCustom as findManyCustomProduct,
  customCount as customCountProduct,
  findManyExternal as findManyExternalProduct,
  externalCount as externalCountProduct,
  clientUpsert as clientUpsertProduct,
  count as countProduct,
  find as findProduct,
  findMany as findManyProduct,
  insert as insertProduct,
  insertMany as insertManyProduct,
  maybeFind as maybeFindProduct,
  remove as removeProduct,
  removeAll as removeAllProduct,
  update as updateProduct,
  upsert as upsertProduct,
} from 'src/db/entities/Product'
const ProductEntity = createEntity('Product', {
  findManyByRecipeIds: findManyByRecipeIdsProduct,
  findManyCustom: findManyCustomProduct,
  customCount: customCountProduct,
  findManyExternal: findManyExternalProduct,
  externalCount: externalCountProduct,
  clientUpsert: clientUpsertProduct,
  count: countProduct,
  find: findProduct,
  findMany: findManyProduct,
  insert: insertProduct,
  insertMany: insertManyProduct,
  maybeFind: maybeFindProduct,
  remove: removeProduct,
  removeAll: removeAllProduct,
  update: updateProduct,
  upsert: upsertProduct,
})
export { ProductEntity as Product }

import {
  findManyByProductIds as findManyByProductIdsRecipe,
  clientUpsert as clientUpsertRecipe,
  count as countRecipe,
  find as findRecipe,
  findMany as findManyRecipe,
  insert as insertRecipe,
  maybeFind as maybeFindRecipe,
  remove as removeRecipe,
  removeAll as removeAllRecipe,
  update as updateRecipe,
  upsert as upsertRecipe,
} from 'src/db/entities/Recipe'
const RecipeEntity = createEntity('Recipe', {
  findManyByProductIds: findManyByProductIdsRecipe,
  clientUpsert: clientUpsertRecipe,
  count: countRecipe,
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
const RecipeItemEntity = createEntity('RecipeItem', {
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

import {
  clientUpsert as clientUpsertRecurringEvent,
  count as countRecurringEvent,
  find as findRecurringEvent,
  findMany as findManyRecurringEvent,
  insert as insertRecurringEvent,
  insertMany as insertManyRecurringEvent,
  maybeFind as maybeFindRecurringEvent,
  remove as removeRecurringEvent,
  removeAll as removeAllRecurringEvent,
  update as updateRecurringEvent,
  upsert as upsertRecurringEvent,
} from 'src/db/entities/RecurringEvent'
const RecurringEventEntity = createEntity('RecurringEvent', {
  clientUpsert: clientUpsertRecurringEvent,
  count: countRecurringEvent,
  find: findRecurringEvent,
  findMany: findManyRecurringEvent,
  insert: insertRecurringEvent,
  insertMany: insertManyRecurringEvent,
  maybeFind: maybeFindRecurringEvent,
  remove: removeRecurringEvent,
  removeAll: removeAllRecurringEvent,
  update: updateRecurringEvent,
  upsert: upsertRecurringEvent,
})
export { RecurringEventEntity as RecurringEvent }

export const allEntities = {
  AppState: AppStateEntity,
  Person: PersonEntity,
  Product: ProductEntity,
  Recipe: RecipeEntity,
  RecipeItem: RecipeItemEntity,
  RecurringEvent: RecurringEventEntity,
}
export type AnyDatabaseEntity = (typeof allEntities)[keyof typeof allEntities]
