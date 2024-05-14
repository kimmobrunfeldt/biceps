import csv from 'csv-parser'
import fs from 'fs'
import path from 'path'
import {
  ProductBeforeDatabase,
  ProductBeforeDatabaseSchema,
} from 'src/db/schemas/ProductSchema'
import { finished } from 'stream/promises'

type Row = {
  name: string
  'energy,calculated (kJ)': string
  'fat, total (g)': string
  'fatty acids, total saturated (g)': string
  'carbohydrate, available (g)': string
  'sugars, total (g)': string
  'protein, total (g)': string
  'salt (mg)': string
}

async function main() {
  const results: Row[] = []

  const stream = fs
    .createReadStream(path.join(__dirname, '../data/fineli-resultset.csv'))
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => results.push(data))

  await finished(stream)

  const processed = results
    .filter((row) => {
      return [
        row.name,
        Number.isFinite(parseNumeric(row['energy,calculated (kJ)'])),
      ].every(Boolean)
    })
    .map((row) => {
      const product: ProductBeforeDatabase = {
        __type: 'Product',
        name: row.name,
        kcal: Math.round(parseNumeric(row['energy,calculated (kJ)']) / 4.184),
        fatTotal: parseNumeric(row['fat, total (g)']),
        fatSaturated: parseNumeric(row['fatty acids, total saturated (g)']),
        protein: parseNumeric(row['protein, total (g)']),
        carbsTotal: parseNumeric(row['protein, total (g)']),
        carbsSugar: parseNumeric(row['sugars, total (g)']),
        salt: parseNumeric(row['salt (mg)']) / 1000,
      }
      try {
        return ProductBeforeDatabaseSchema.parse(product)
      } catch (err) {
        return null
      }
    })
    .filter((product) => product !== null)
  for (const product of processed) {
    console.log(JSON.stringify(product))
  }
}

function parseNumeric(value: string): number {
  const trimmed = value.trim().replaceAll('<', '')
  if (trimmed.toLowerCase() === 'n/a') return 0
  return Math.round((parseFloat(trimmed) + Number.EPSILON) * 100) / 100
}

main()
