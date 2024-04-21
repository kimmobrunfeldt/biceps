import { Box, Title } from '@mantine/core'

export const WEEKDAY_MAPPING = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

type Props = {
  weekday: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
}

export function DaySchedule({ weekday }: Props) {
  return (
    <Box>
      <Title order={2} pb="sm">
        {WEEKDAY_MAPPING[weekday]}
      </Title>

      <Box pb="xl">
        <Box>No schedule</Box>
      </Box>
    </Box>
  )
}
