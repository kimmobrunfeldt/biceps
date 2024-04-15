import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextInput, Title } from '@mantine/core'
import { useDB } from '@vlcn.io/react'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { APP_STATE_KEY, DATABASE_NAME } from 'src/constants'
import { createLoaders } from 'src/db/dataLoaders'
import { AppState } from 'src/db/entities'
import { resolver } from 'src/db/resolvers/resolver'
import { PersonResolvedSchema } from 'src/db/schemas/PersonSchema'
import { useGetAppState, useUpdatePerson } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { sleep } from 'src/utils/utils'
import * as z from 'zod'

const FormSchema = z.object({
  name: PersonResolvedSchema.shape.name,
})
type FormData = z.infer<typeof FormSchema>

export function ProfileSettings() {
  const ctx = useDB(DATABASE_NAME)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const { updatePerson } = useUpdatePerson()
  const appStateResult = useGetAppState()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = useForm<FormData>({
    defaultValues: { name: '' },
    resolver: zodResolver(FormSchema),
  })

  useEffect(() => {
    if (!appStateResult.data?.selectedPerson.name) return
    setValue('name', appStateResult.data.selectedPerson.name)
  }, [setValue, appStateResult.data?.selectedPerson.name])

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!appStateResult.data || isSubmitting) return

      console.log('onSubmit', data)
      setIsSubmitting(true)
      try {
        await withNotifications({
          fn: async () => {
            await sleep(1000)
            await updatePerson(appStateResult.data.selectedPerson.id, {
              name: data.name,
            })
            const curr = await resolver({
              row: await AppState.find({
                connection: ctx.db,
                where: { key: APP_STATE_KEY },
              }),
              loaders: createLoaders(ctx.db),
              connection: ctx.db,
            })
            console.log('curr', curr)
            //await appStateResult.refetch()
          },
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [updatePerson, appStateResult.data, withNotifications, isSubmitting, ctx.db]
  )

  return (
    <>
      <Title>Profile</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Your name"
              placeholder="Name"
              error={errors.name?.message}
              disabled={appStateResult.isLoading || isSubmitting}
            />
          )}
        />

        <Button
          type="submit"
          mt="md"
          disabled={!isDirty || isSubmitting || appStateResult.isLoading}
          loading={isSubmitting}
        >
          Save
        </Button>
      </form>
    </>
  )
}
