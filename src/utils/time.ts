import {
  RecurringEventResolved,
  RecurringEventRow,
} from 'src/db/schemas/RecurringEventSchema'

export function weekdayNumberToLongName(weekday: RecurringEventRow['weekday']) {
  switch (weekday) {
    case 1:
      return 'Monday'
    case 2:
      return 'Tuesday'
    case 3:
      return 'Wednesday'
    case 4:
      return 'Thursday'
    case 5:
      return 'Friday'
    case 6:
      return 'Saturday'
    case 7:
      return 'Sunday'
  }
}

export function longNameToWeekdayNumber(
  weekday: ReturnType<typeof weekdayNumberToLongName>
) {
  switch (weekday) {
    case 'Monday':
      return 1
    case 'Tuesday':
      return 2
    case 'Wednesday':
      return 3
    case 'Thursday':
      return 4
    case 'Friday':
      return 5
    case 'Saturday':
      return 6
    case 'Sunday':
      return 7
  }
}

export type WeekdayLongName = ReturnType<typeof getWeekdayLongNames>[number]
export function getWeekdayLongNames() {
  return [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ] as const
}

export function getWeekdays() {
  return [1, 2, 3, 4, 5, 6, 7] as const
}

export function formatTime({ hour, minute }: RecurringEventResolved['time']) {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

export function parseTime(value: string) {
  return {
    hour: parseInt(value.split(':')[0], 10),
    minute: parseInt(value.split(':')[1], 10),
  }
}
