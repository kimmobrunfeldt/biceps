import { TXAsync } from '@vlcn.io/xplat-api'
import { APP_STATE_KEY } from 'src/constants'
import { upsertRecipe } from 'src/core/recipeCore'
import { AppState, Person, PersonRecipe } from 'src/db/entities'
import { getLogger } from 'src/utils/logger'

const logger = getLogger('db:seedData')

export async function upsertSeedData(connection: TXAsync) {
  logger.info('Upserting seed data')
  const persons = await Person.findMany({
    connection,
  })
  if (persons.length > 0) {
    logger.info('Seed data already exists')
    return
  }

  const person = await Person.clientUpsert({
    connection,
    object: {
      id: 'biceps-demo-user',
      name: 'John Doe',
    },
    onConflict: ['name'],
  })
  const { recipeId } = await upsertRecipe(connection, {
    name: 'My recipe',
    id: 'biceps-demo-recipe',
    portions: 1,
    recipeItems: [
      {
        __type: 'RecipeItem',
        weightGrams: 100,
        product: {
          __type: 'Product',
          id: 'biceps-demo-recipe-item-1',
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
          id: 'biceps-demo-recipe-item-2',
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
        onboardingCompletedAt: new Date(),
      },
    })
  }
}
