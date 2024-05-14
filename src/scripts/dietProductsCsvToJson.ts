import csv from 'csv-parser'
import fs from 'fs'
import path from 'path'
import {
  ProductBeforeDatabase,
  ProductBeforeDatabaseSchema,
} from 'src/db/schemas/ProductSchema'
import { finished } from 'stream/promises'

type Row = {
  Product: string
  'Kcal / 100g or ml': string
  'Fat (g)': string
  'of which saturated (g)': string
  'Carbs (g)': string
  'of which sugars (g)': string
  'Protein (g)': string
  'Salt (g)': string
}

async function main() {
  const results: Row[] = []

  const stream = fs
    .createReadStream(path.join(__dirname, '../data/Diet - Products.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))

  await finished(stream)

  const processed = results
    .filter((row) => {
      return [
        row.Product,
        Number.isFinite(parseFloat(row['Kcal / 100g or ml'])),
      ].every(Boolean)
    })
    .map((row) => {
      const product: ProductBeforeDatabase = {
        __type: 'Product',
        name: row.Product,
        kcal: parseFloat(row['Kcal / 100g or ml']),
        fatTotal: parseFloat(row['Fat (g)']),
        fatSaturated: parseFloat(row['of which saturated (g)']),
        protein: parseFloat(row['Protein (g)']),
        carbsTotal: parseFloat(row['Carbs (g)']),
        carbsSugar: parseFloat(row['of which sugars (g)']),
        salt: parseFloat(row['Salt (g)']),
      }

      return ProductBeforeDatabaseSchema.parse(product)
    })
  for (const product of processed) {
    console.log(JSON.stringify(product))
  }
}

main()
