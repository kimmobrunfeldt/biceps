import { Temporal } from '@js-temporal/polyfill'
import { Box, Group, Paper, Text, rem } from '@mantine/core'
import { IconCheese, IconMeat, IconSalad } from '@tabler/icons-react'
import { useState } from 'react'
import { Nutrition } from 'src/db/schemas/common'
import { formatGrams } from 'src/utils/format'
import classes from './DailyStats.module.css'

const calendar = new Intl.DateTimeFormat().resolvedOptions().calendar

type Props = {
  dayConsumed: Nutrition
  dayTotals: Nutrition
}

export function DailyStats({ dayConsumed, dayTotals }: Props) {
  const today = Temporal.Now.plainDate(calendar)
  const [date, _setDate] = useState(today)

  return (
    <div className={classes.root}>
      <div className={classes.controls}>
        <div className={classes.date}>
          <Text className={classes.day}>
            {date.toLocaleString('en-US', { calendar, day: 'numeric' })}
          </Text>
          <Text className={classes.month}>
            {date.toLocaleString('en-US', { calendar, month: 'long' })}
          </Text>
        </div>
      </div>
      <Group miw={200}>
        <Stat
          label="Protein"
          number={`${formatGrams(dayConsumed.protein)}g`}
          numberTotal={dayTotals.protein}
          icon={IconMeat}
        />

        <Stat
          label="Fat"
          number={`${formatGrams(dayConsumed.fatTotal)}g`}
          numberTotal={dayTotals.fatTotal}
          icon={IconCheese}
        />

        <Stat
          label="Calories"
          number={`${dayConsumed.kcal} kcal`}
          numberTotal={dayTotals.kcal}
          icon={IconSalad}
        />
      </Group>
    </div>
  )
}

function Stat({
  label,
  number,
  numberTotal,
  icon: Icon,
}: {
  label: string
  number: string
  numberTotal: string | number
  icon: typeof IconSalad
}) {
  return (
    <Paper
      className={classes.stat}
      radius="md"
      shadow="md"
      p="xs"
      key={label}
      maw={200}
    >
      <Icon
        style={{ width: rem(36), height: rem(36) }}
        className={classes.icon}
        stroke={1.5}
      />
      <Box>
        <Text className={classes.label}>{label}</Text>
        <Text fz="xs" className={classes.count}>
          <span className={classes.value}>{number}</span> / {numberTotal}
        </Text>
      </Box>
    </Paper>
  )
}
