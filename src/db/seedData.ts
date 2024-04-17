import { TXAsync } from '@vlcn.io/xplat-api'
import { APP_STATE_KEY } from 'src/constants'
import { upsertRecipe } from 'src/core/recipeCore'
import { AppState, Person, PersonRecipe } from 'src/db/entities'

export async function upsertSeedData(connection: TXAsync) {
  const person = await Person.clientUpsert({
    connection,
    object: {
      name: 'John Doe',
    },
    onConflict: ['name'],
  })
  const { recipeId } = await upsertRecipe(connection, {
    name: 'My recipe',
    recipeItems: [
      {
        weightGrams: 100,
        item: {
          name: 'Pirkka Parhaat Tomato',
          kcal: 10,
          fatTotal: 0,
          fatSaturated: 0,
          carbsTotal: 0,
          carbsSugar: 0,
          salt: 0,
          protein: 0,
        },
      },
      {
        weightGrams: 100,
        item: {
          name: 'Pirkka Parhaat Pasta',
          kcal: 10,
          fatTotal: 0,
          fatSaturated: 0,
          carbsTotal: 0,
          carbsSugar: 0,
          salt: 0,
          protein: 0,
        },
      },
    ],
  })
  await PersonRecipe.clientUpsert({
    connection,
    object: {
      personId: person.id,
      recipeId,
    },
    onConflict: ['personId', 'recipeId'],
  })
  const appState = await AppState.maybeFind({
    connection,
    where: { key: APP_STATE_KEY },
  })
  if (!appState) {
    await AppState.insert({
      connection,
      object: {
        key: APP_STATE_KEY,
        selectedPersonId: person.id,
      },
    })
  }
}
