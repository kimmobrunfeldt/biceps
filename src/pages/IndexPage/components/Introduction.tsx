import {
  Box,
  BoxProps,
  Button,
  Stack,
  Stepper,
  Text,
  Title,
} from '@mantine/core'
import { useModals } from '@mantine/modals'
import { IconX } from '@tabler/icons-react'
import { useMediaQuery } from '@uidotdev/usehooks'
import { Link } from 'src/components/Link'
import { Query } from 'src/components/Query'
import { AppStateResolved } from 'src/db/schemas/AppStateSchema'
import { useGetAppState, useUpdateAppState } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { routes } from 'src/routes'
import { theme } from 'src/theme'
import classes from './Introduction.module.css'

export function Introduction() {
  const appStateResult = useGetAppState()
  const modals = useModals()
  const { updateAppState } = useUpdateAppState()
  const { withNotifications } = useNotifications()
  const isWide = useMediaQuery(`(min-width: ${theme.breakpoints!.xl})`)

  async function onClick() {
    modals.openConfirmModal({
      title: 'Data storage warning',
      children: (
        <Stack gap="xs">
          <Text size="sm">
            All data is stored locally in your browser. If you clear site data
            from the browser settings, your nutrition plans will be gone!
          </Text>
          <Text size="sm">
            <b>If you are using Safari</b>, you need to add the website on your
            home screen to prevent automatic data deletion.
          </Text>
          <Text size="sm">
            <b>Remember to export your data</b> via {routes.settings.title} page
            before clearing site data.
          </Text>
        </Stack>
      ),
      labels: { confirm: 'I understand', cancel: 'Cancel' },
      closeOnConfirm: true,
      onConfirm: async () => {
        await withNotifications({
          fn: async () => {
            await updateAppState({
              onboardingCompletedAt: new Date(),
            })
          },
          success: {
            message: 'Onboarding completed! 💪',
            color: 'green',
          },
          error: {
            message: 'Failed to mark onboarding complete!',
            color: 'red',
            icon: <IconX />,
          },
        })
      },
    })
  }

  return (
    <Box>
      <Query result={appStateResult}>
        {(data) => {
          const stepIndex = onboardingStateToIndex(data.onboardingState)

          const stepWrapperProps = {
            py: { base: 0, xl: 'md' },
            px: 'xs',
          } satisfies BoxProps

          return (
            <Stack gap="xl">
              <Box className={classes.root}>
                <Title c="white" order={2} fz="h3" mb="md" ff="heading">
                  Ready to get gains?
                </Title>
                <Text c="white" maw={700}>
                  Biceps app helps with nutrition planning so you can crush your
                  fitness goals. All data is securely stored locally in the
                  browser and won&apos;t be sent to a server.
                </Text>
              </Box>

              <Box>
                <Title order={2} fz="h3" mb="xl">
                  Let&rsquo;s get you started
                </Title>
                <Stepper
                  active={stepIndex}
                  orientation={isWide ? 'horizontal' : 'vertical'}
                >
                  <Stepper.Step
                    label="Add your details"
                    description="Used to personalise the app"
                  >
                    <Box {...stepWrapperProps}>
                      <Title order={3} fw="bold" fz="h4" mb="sm">
                        Step 1
                      </Title>
                      <Box>
                        Go to{' '}
                        <Link to={routes.settings.path}>
                          {routes.settings.title}
                        </Link>{' '}
                        page and save your name.
                      </Box>
                    </Box>
                  </Stepper.Step>
                  <Stepper.Step
                    label="Create a recipe"
                    description="Precise macros will be calculated for each recipe"
                  >
                    <Box {...stepWrapperProps}>
                      <Title order={3} fw="bold" fz="h4" mb="sm">
                        Step 2
                      </Title>
                      <Box>
                        Go to{' '}
                        <Link to={routes.recipes.index.path}>
                          {routes.recipes.index.title}
                        </Link>{' '}
                        page and add a recipe.
                      </Box>
                    </Box>
                  </Stepper.Step>
                  <Stepper.Step
                    label="Add a meal plan"
                    description="When eating according to plan, you'll know the exact nutrition intake"
                  >
                    <Box {...stepWrapperProps}>
                      <Title order={3} fw="bold" fz="h4" mb="sm">
                        Step 3
                      </Title>
                      <Box>
                        Go to{' '}
                        <Link to={routes.weeklySchedule.index.path}>
                          {routes.weeklySchedule.index.title}
                        </Link>{' '}
                        page and add a meal plan.
                      </Box>
                    </Box>
                  </Stepper.Step>
                  <Stepper.Completed>
                    <Box {...stepWrapperProps}>
                      <Title order={3} fw="bold" fz="h4" mb="sm">
                        Onboarding completed
                      </Title>

                      <Box>
                        Next, edit your full weekly schedule and start following
                        the plan!
                      </Box>

                      <Button mt="xl" onClick={onClick}>
                        Close onboarding
                      </Button>
                    </Box>
                  </Stepper.Completed>
                </Stepper>
              </Box>
            </Stack>
          )
        }}
      </Query>
    </Box>
  )
}

function onboardingStateToIndex(
  onboardingState: AppStateResolved['onboardingState']
): number {
  switch (onboardingState) {
    case 'NewUser':
      return 0
    case 'ProfileCreated':
      return 1
    case 'RecipeAdded':
      return 2
    case 'WeeklyScheduleAdded':
      return 3
    case 'Completed':
      return 4
  }
}
