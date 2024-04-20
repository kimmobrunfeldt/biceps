import { IconAlertCircle } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { useUpsertProduct } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import {
  ProductForm,
  ProductFormFields,
} from 'src/pages/AddProductPage/components/ProductForm'
import { routes } from 'src/routes'
import { useLocation } from 'wouter'

export function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const [_location, setLocation] = useLocation()
  const { upsertProduct } = useUpsertProduct()

  const onSubmit = useCallback(
    async (data: ProductFormFields) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      try {
        await withNotifications({
          fn: async () => {
            await upsertProduct(data)
            setLocation(routes.products.index.path)
          },
          success: { message: `Product '${data.name}' added`, color: 'green' },
          error: (err) => ({
            message: `Adding failed: ${err.message}`,
            color: 'red',
            autoClose: 5000,
            icon: <IconAlertCircle />,
          }),
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [withNotifications, isSubmitting, setLocation, upsertProduct]
  )

  return (
    <PageTemplate title="Add product">
      <ProductForm onSubmit={onSubmit} />
    </PageTemplate>
  )
}
