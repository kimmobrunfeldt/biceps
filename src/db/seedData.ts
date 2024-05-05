import { TXAsync } from '@vlcn.io/xplat-api'
import _ from 'lodash'
import { APP_STATE_KEY } from 'src/constants'
import products from 'src/data/products.json'
import { AppState, Person, Product } from 'src/db/entities'
import { ProductBeforeDatabase } from 'src/db/schemas/ProductSchema'
import { getLogger } from 'src/utils/logger'

const logger = getLogger('db:seedData')

export async function upsertSeedData(connection: TXAsync) {
  logger.info('Upserting seed data')
  const appState = await AppState.maybeFind({
    connection,
    where: { key: APP_STATE_KEY },
  })
  if (appState) {
    logger.info('Seed data already exists')
    return
  }

  const person = await Person.clientUpsert({
    connection,
    object: {
      id: 'biceps-default-user',
      name: '',
    },
    onConflict: ['name'],
  })

  for (const chunk of _.chunk(products, 1000)) {
    await Product.insertMany({
      connection,
      objects: chunk as ProductBeforeDatabase[],
    })
  }

  await AppState.insert({
    connection,
    object: {
      key: APP_STATE_KEY,
      selectedPersonId: person.id,
    },
  })
}
