import { Item } from 'src/db/models/Item'

export type Recipe = {
  id: string
  name: string
}

export async function create(item: Item): Promise<Item> {
  return item
}

export async function find() {
  throw new Error('Not implemented')
}
