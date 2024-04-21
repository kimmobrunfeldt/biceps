import { MantineColor } from '@mantine/core'
import { NutritionPer100Grams } from 'src/db/schemas/common'

export const NUTRITION_CONSTANTS = {
  kcal: {
    label: 'Kcal',
    color: 'purple',
  },
  fat: {
    label: 'Fat',
    color: 'yellow',
  },
  fatTotal: {
    label: 'Total fat',
    color: 'yellow',
  },
  fatSaturated: {
    label: 'Saturated fat',
    color: 'orange',
  },
  carbs: {
    label: 'Carbs',
    color: 'green',
  },
  carbsTotal: {
    label: 'Total carbs',
    color: 'green',
  },
  carbsSugar: {
    label: 'Sugar',
    color: 'cyan',
  },
  sugar: {
    label: 'Sugar',
    color: 'cyan',
  },
  protein: {
    label: 'Protein',
    color: 'purple',
  },
  salt: {
    label: 'Salt',
    color: 'gray',
  },
} satisfies Record<string, { label: string; color: MantineColor }>

export function getLabel(key: keyof typeof NUTRITION_CONSTANTS): string {
  return NUTRITION_CONSTANTS[key].label
}

export function getColor(key: keyof typeof NUTRITION_CONSTANTS): MantineColor {
  return NUTRITION_CONSTANTS[key].color
}

export type MacroDistribution = {
  carbs: number
  fat: number
  protein: number
}

export function calculateMacros(nutrition: NutritionPer100Grams) {
  return {
    weightGrams: 100,
    kcal: nutrition.kcal,
    keys: ['carbs', 'fat', 'protein'] as const,
    macroDistribution: {
      carbs: nutrition.carbsTotal,
      fat: nutrition.fatTotal,
      protein: nutrition.protein,
    },
  }
}
