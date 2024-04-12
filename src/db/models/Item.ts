export type Item = {
  id: string
  name: string
  kcal: number
  fatTotal: number
  fatSaturated: number
  carbsTotal: number
  carbsSugar: number
  protein: number
  salt: number
  imageUrl?: string
}

export async function create(item: Item): Promise<Item> {
  return item
}

export async function find() {
  throw new Error('Not implemented')
}
