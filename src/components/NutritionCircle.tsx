import { Center, RingProgress } from '@mantine/core'
import { IconToolsKitchen2 } from '@tabler/icons-react'
import { NutritionPer100Grams } from 'src/db/schemas/common'
import { formatGrams } from 'src/utils/format'
import { calculateMacros, getColor, getLabel } from 'src/utils/nutrition'

type Props = {
  variant: 'icon' | 'large'
  nutrition: NutritionPer100Grams
}

export function NutritionCircle({ nutrition, variant }: Props) {
  const macros = calculateMacros(nutrition)

  const sections = macros.keys.map((key) => {
    const value = macros.macroDistribution[key]
    return {
      value,
      color: getColor(key),
      tooltip: `${formatGrams(value)}g ${getLabel(key).toLocaleLowerCase()} per 100g (${Math.round(value)}%)`,
    }
  })

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
  const icon = <RingProgress size={36} thickness={8} sections={sections} />

  return variant === 'icon' ? icon : large
}
