import { Center, RingProgress } from '@mantine/core'
import { IconToolsKitchen2 } from '@tabler/icons-react'
import _ from 'lodash'
import { Nutrition } from 'src/db/schemas/common'
import { formatGrams } from 'src/utils/format'
import { calculateMacros, getColor, getLabel } from 'src/utils/nutrition'

type Props = {
  variant: 'icon' | 'large'
  nutrition: Nutrition
  weightGrams?: number
}

export function NutritionCircle({
  nutrition,
  variant,
  weightGrams = 100,
}: Props) {
  const macros = calculateMacros(nutrition)
  const allZero = Object.values(macros.macroDistribution).every(
    (value) => value === 0
  )
  const macroSections = allZero
    ? []
    : macros.keys.map((key) => {
        const value = macros.macroDistribution[key]
        const percentage = (value / weightGrams) * 100
        return {
          value: percentage,
          color: getColor(key),
          tooltip: `${formatGrams(value)}g ${getLabel(key).toLocaleLowerCase()} / ${weightGrams}g (${Math.round(percentage)}%)`,
        }
      })

  const total = _.sum(macroSections.map((s) => s.value))
  const rest = 100 - total
  const sections = [
    ...macroSections,
    {
      value: rest,
      color: 'gray',
      tooltip: 'Nutrition macros distribution',
    },
  ]

  const large = (
    <RingProgress
      size={120}
      thickness={16}
      label={
        <Center>
          <IconToolsKitchen2 color="gray" />
        </Center>
      }
      sections={sections}
    />
  )
  const icon = (
    <RingProgress size={36} thickness={8} sections={sections} m={-4} />
  )
  return variant === 'icon' ? icon : large
}
