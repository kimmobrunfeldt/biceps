import { TXAsync } from '@vlcn.io/xplat-api'
import { APP_STATE_KEY } from 'src/constants'
import { upsertRecipe } from 'src/core/recipeCore'
import { AppState, Person, PersonRecipe } from 'src/db/entities'

export async function upsertSeedData(connection: TXAsync) {
  const maybePerson = await Person.maybeFind({
    connection,
    where: { name: 'John Doe' },
  })
  if (maybePerson) {
    console.log('Seed data already exists')
    return
  }

  const person = await Person.clientUpsert({
    connection,
    object: {
      name: 'John Doe',
    },
    onConflict: ['name'],
  })
  const { recipeId } = await upsertRecipe(connection, {
    name: 'My recipe',
    portions: 1,
    recipeItems: [
      {
        __type: 'RecipeItem',
        weightGrams: 100,
        product: {
          __type: 'Product',
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
        __type: 'RecipeItem',
        weightGrams: 100,
        product: {
          __type: 'Product',
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
