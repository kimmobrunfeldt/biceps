import { Box, Button, Group, Stack, Stepper, Text, Title } from '@mantine/core'
import { useState } from 'react'
import { Query } from 'src/components/Query'
import { useGetAppState } from 'src/hooks/useDatabase'
import classes from './Introduction.module.css'

export function Introduction() {
  const appStateResult = useGetAppState()

  const [active, setActive] = useState(0)
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current))
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current))

  return (
    <Box>
      <Query result={appStateResult}>
        {(data) => {
          if (data.onboardingState === 'Completed') return null

          return (
            <Stack gap="xl">
              <Box className={classes.root}>
                <Title c="white" order={1} fz={28} mb="md" ff="heading">
                  Ready to get gains?
                </Title>
                <Text c="white" maw={700}>
                  Biceps helps with nutrition planning ensuring you will crush
                  your fitness goals. All data is securely stored locally in the
                  browser and won&apos;t be sent to a server.
                </Text>
              </Box>

              <Box p="md">
                <Stepper
                  active={active}
                  onStepClick={setActive}
                  orientation="vertical"
                >
                  <Stepper.Step
                    label="Add your details"
                    description="Used to personalise the app"
                  >
                    Step 1 content: Create a new person
                  </Stepper.Step>
                  <Stepper.Step
                    label="Create recipes"
                    description="Hitting macro goals is a breeze with recipes"
                  >
                    Step 2 content: Verify email
                  </Stepper.Step>
                  <Stepper.Step
                    label="Plan weekly schedule"
                    description="Well planned is half done"
                  >
                    Step 3 content: Get full access
                  </Stepper.Step>
                  <Stepper.Completed>
                    Completed, click back button to get to previous step
                  </Stepper.Completed>
                </Stepper>

                <Group justify="center" mt="xl">
                  <Button variant="default" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep}>Next step</Button>
                </Group>
                <Text>... or take a look at John Doe's example plan.</Text>
              </Box>
            </Stack>
          )
        }}
      </Query>
    </Box>
  )
}
