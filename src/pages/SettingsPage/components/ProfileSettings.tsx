import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextInput, Title } from '@mantine/core'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { PersonResolvedSchema } from 'src/db/schemas/PersonSchema'
import { useGetAppState, useUpdatePerson } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import * as z from 'zod'

const FormSchema = z.object({
  name: PersonResolvedSchema.shape.name,
})
type FormData = z.infer<typeof FormSchema>

export function ProfileSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const { updatePerson } = useUpdatePerson()
  const appStateResult = useGetAppState()

  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { isDirty, errors },
  } = useForm<FormData>({
    defaultValues: { name: '' },
    resolver: zodResolver(FormSchema),
  })

  useEffect(() => {
    if (!appStateResult.data?.selectedPerson.name) return
    // Use reset to clear dirty status
    resetField('name', {
      defaultValue: appStateResult.data.selectedPerson.name,
    })
  }, [setValue, resetField, appStateResult.data?.selectedPerson.name])

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!appStateResult.data || isSubmitting) return

      setIsSubmitting(true)
      try {
        await withNotifications({
          fn: async () => {
            await updatePerson(appStateResult.data.selectedPerson.id, {
              name: data.name,
            })
          },
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [updatePerson, appStateResult.data, withNotifications, isSubmitting]
  )

  return (
    <>
      <Title order={2} fz="xl" mb="md">
        Profile
      </Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              maw={300}
              label="Your name"
              placeholder="Name"
              error={errors.name?.message}
              disabled={appStateResult.isLoading || isSubmitting}
            />
          )}
        />

        <Button
          type="submit"
          mt="lg"
          disabled={!isDirty || isSubmitting || appStateResult.isLoading}
          loading={isSubmitting}
        >
          Save
        </Button>
      </form>
    </>
  )
}
