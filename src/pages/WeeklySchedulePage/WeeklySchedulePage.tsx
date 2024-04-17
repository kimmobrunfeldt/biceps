import { Box, Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { PageTemplate } from 'src/components/PageTemplate'
import {
  DaySchedule,
  WEEKDAY_MAPPING,
} from 'src/pages/WeeklySchedulePage/components/DaySchedule'

export function WeeklySchedulePage() {
  const weekdays = Object.keys(WEEKDAY_MAPPING) as Array<
    keyof typeof WEEKDAY_MAPPING
  >
  return (
    <PageTemplate
      title="Weekly Schedule"
      titleRightSection={
        <Button leftSection={<IconPlus size={14} />}>Add schedule</Button>
      }
    >
      <Box>
        {weekdays.map((weekday) => {
          return <DaySchedule key={weekday} weekday={weekday} />
        })}
      </Box>
    </PageTemplate>
  )
}
