// Warning! This file was auto-generated with 'npm run generate'. Do not edit manually.

/* eslint-disable no-restricted-imports */

import { createEntity } from 'src/db/utils/entityInterface'

import {
  find as findItem,
  findMany as findManyItem,
  insert as insertItem,
  remove as removeItem,
  update as updateItem,
  upsert as upsertItem,
} from 'src/db/entities/Item'
const ItemEntity = createEntity({
  find: findItem,
  findMany: findManyItem,
  insert: insertItem,
  remove: removeItem,
  update: updateItem,
  upsert: upsertItem,
})
export { ItemEntity as Item }

import {
  find as findRecipe,
  findMany as findManyRecipe,
  insert as insertRecipe,
  remove as removeRecipe,
  update as updateRecipe,
  upsert as upsertRecipe,
} from 'src/db/entities/Recipe'
const RecipeEntity = createEntity({
  find: findRecipe,
  findMany: findManyRecipe,
  insert: insertRecipe,
  remove: removeRecipe,
  update: updateRecipe,
  upsert: upsertRecipe,
})
export { RecipeEntity as Recipe }

import {
  find as findRecipeItem,
  findMany as findManyRecipeItem,
  insert as insertRecipeItem,
  upsert as upsertRecipeItem,
} from 'src/db/entities/RecipeItem'
const RecipeItemEntity = createEntity({
  find: findRecipeItem,
  findMany: findManyRecipeItem,
  insert: insertRecipeItem,
  upsert: upsertRecipeItem,
})
export { RecipeItemEntity as RecipeItem }

export const allEntities = {
  Item: ItemEntity,
  Recipe: RecipeEntity,
  RecipeItem: RecipeItemEntity,
}
export type AnyDatabaseEntity = (typeof allEntities)[keyof typeof allEntities]
