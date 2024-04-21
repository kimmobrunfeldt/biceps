import { TXAsync } from '@vlcn.io/xplat-api'
import {
  AppState,
  Person,
  PersonRecipe,
  Product,
  Recipe,
  RecipeItem,
} from 'src/db/entities'
import { upsertSeedData } from 'src/db/seedData'

/**
 * Note: this only marks the rows as deleted, it does not actually delete them.
 * This is done because CRDT.
 */
export async function deleteAllData(connection: TXAsync) {
  await connection.tx(async (tx) => {
    await RecipeItem.removeAll({ connection: tx })
    await Product.removeAll({ connection: tx })
    await Recipe.removeAll({ connection: tx })
    await PersonRecipe.removeAll({ connection: tx })
    await Person.removeAll({ connection: tx })
    await AppState.removeAll({ connection: tx })
    await upsertSeedData(tx)
  })
}