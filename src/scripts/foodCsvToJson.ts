import csv from 'csv-parser'
import fs from 'fs'
import path from 'path'
import {
  ProductBeforeDatabase,
  ProductBeforeDatabaseSchema,
} from 'src/db/schemas/ProductSchema'
import { finished } from 'stream/promises'

type Row = {
  Category: string
  Description: string
  'Nutrient Data Bank Number': string
  'Data.Alpha Carotene': string
  'Data.Beta Carotene': string
  'Data.Beta Cryptoxanthin': string
  'Data.Carbohydrate': string
  'Data.Cholesterol': string
  'Data.Choline': string
  'Data.Fiber': string
  'Data.Lutein and Zeaxanthin': string
  'Data.Lycopene': string
  'Data.Niacin': string
  'Data.Protein': string
  'Data.Retinol': string
  'Data.Riboflavin': string
  'Data.Selenium': string
  'Data.Sugar Total': string
  'Data.Thiamin': string
  'Data.Water': string
  'Data.Fat.Monosaturated Fat': string
  'Data.Fat.Polysaturated Fat': string
  'Data.Fat.Saturated Fat': string
  'Data.Fat.Total Lipid': string
  'Data.Major Minerals.Calcium': string
  'Data.Major Minerals.Copper': string
  'Data.Major Minerals.Iron': string
  'Data.Major Minerals.Magnesium': string
  'Data.Major Minerals.Phosphorus': string
  'Data.Major Minerals.Potassium': string
  'Data.Major Minerals.Sodium': string
  'Data.Major Minerals.Zinc': string
  'Data.Vitamins.Vitamin A - RAE': string
  'Data.Vitamins.Vitamin B12': string
  'Data.Vitamins.Vitamin B6': string
  'Data.Vitamins.Vitamin C': string
  'Data.Vitamins.Vitamin E': string
  'Data.Vitamins.Vitamin K': string
}
async function main() {
  const results: Row[] = []

  const stream = fs
    .createReadStream(path.join(__dirname, '../data/food.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))

  await finished(stream)

  const processed = results
    .filter((row) => {
      return [
        row.Description.includes(', raw'),
        !row.Description.includes('Cake batter'),
      ].every(Boolean)
    })
    .map((food) => {
      const fatTotal = parseFloat(food['Data.Fat.Total Lipid'])
      const protein = parseFloat(food['Data.Protein'])
      const carbsTotal = parseFloat(food['Data.Carbohydrate'])

      const product: ProductBeforeDatabase = {
        __type: 'Product',
        name: food.Description,
        kcal: Math.round(
          ((fatTotal * 9 + protein * 4 + carbsTotal * 4) * 100) / 1000
        ),
        fatTotal,
        fatSaturated: parseFloat(food['Data.Fat.Saturated Fat']),
        protein,
        carbsTotal,
        carbsSugar: parseFloat(food['Data.Sugar Total']),
        salt: parseFloat(food['Data.Major Minerals.Sodium']) / 1000,
      }
      return ProductBeforeDatabaseSchema.parse(product)
    })
  for (const product of processed) {
    console.log(JSON.stringify(product))
  }
}

main()
