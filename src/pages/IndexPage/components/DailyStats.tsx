import { Temporal } from '@js-temporal/polyfill'
import { Group, Paper, Text, UnstyledButton, rem } from '@mantine/core'
import {
  IconBike,
  IconChevronDown,
  IconChevronUp,
  IconRun,
  IconSwimming,
} from '@tabler/icons-react'
import { useState } from 'react'
import classes from './DailyStats.module.css'

const data = [
  { icon: IconRun, label: 'Running' },
  { icon: IconSwimming, label: 'Swimming' },
  { icon: IconBike, label: 'Bike' },
]

const calendar = new Intl.DateTimeFormat().resolvedOptions().calendar

export function DailyStats() {
  const today = Temporal.Now.plainDate(calendar)
  const [date, setDate] = useState(today)

  const stats = data.map((stat) => (
    <Paper
      className={classes.stat}
      radius="md"
      shadow="md"
      p="xs"
      key={stat.label}
    >
      <stat.icon
        style={{ width: rem(32), height: rem(32) }}
        className={classes.icon}
        stroke={1.5}
      />
      <div>
        <Text className={classes.label}>{stat.label}</Text>
        <Text fz="xs" className={classes.count}>
          <span className={classes.value}>
            {Math.floor(Math.random() * 6 + 4)}km
          </span>{' '}
          / 10km
        </Text>
      </div>
    </Paper>
  ))

  return (
    <div className={classes.root}>
      <div className={classes.controls}>
        <UnstyledButton
          className={classes.control}
          onClick={() => setDate((current) => current.add({ days: 1 }))}
        >
          <IconChevronUp
            style={{ width: rem(16), height: rem(16) }}
            className={classes.controlIcon}
            stroke={1.5}
          />
        </UnstyledButton>

        <div className={classes.date}>
          <Text className={classes.day}>
            {date.toLocaleString('en-US', { calendar, day: 'numeric' })}
          </Text>
          <Text className={classes.month}>
            {date.toLocaleString('en-US', { calendar, month: 'long' })}
          </Text>
        </div>

        <UnstyledButton
          className={classes.control}
          onClick={() => setDate((current) => current.subtract({ days: 1 }))}
        >
          <IconChevronDown
            style={{ width: rem(16), height: rem(16) }}
            className={classes.controlIcon}
            stroke={1.5}
          />
        </UnstyledButton>
      </div>
      <Group style={{ flex: 1 }}>{stats}</Group>
    </div>
  )
}
