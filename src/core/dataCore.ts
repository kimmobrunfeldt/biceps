import { TXAsync } from '@vlcn.io/xplat-api'
import { Item, Person, PersonRecipe, Recipe, RecipeItem } from 'src/db/entities'
import { upsertSeedData } from 'src/db/seedData'

/**
 * Note: this only marks the items as deleted, it does not actually delete them.
 * This is done because CRDT.
 */
export async function deleteAllData(connection: TXAsync) {
  await connection.tx(async (tx) => {
    await RecipeItem.removeAll({ connection: tx })
    await Item.removeAll({ connection: tx })
    await Recipe.removeAll({ connection: tx })
    await PersonRecipe.removeAll({ connection: tx })
    await Person.removeAll({ connection: tx })
    await upsertSeedData(tx)
  })
}
