import { NotificationData, notifications } from '@mantine/notifications'
import _ from 'lodash'
import { nanoId } from 'src/utils/nanoid'
import { ensureError, sleep } from 'src/utils/utils'

// Use this type internally in case later we'll need to modify the exposed type
export type NotificationOptions = NotificationData
type WithLoadingNotificationsOptions<T> = {
  fn: (...args: any) => Promise<T>
  minLoadingNotificationMs?: number
  loading?: NotificationOptions
  success?: NotificationOptions | ((result: T) => NotificationOptions)
  error?: NotificationOptions | ((err: Error) => NotificationOptions)
}

export function useNotifications() {
  function notification(opts: NotificationData) {
    notifications.show({
      withCloseButton: true,
      autoClose: 5000,
      ...opts,
    })
  }

  function withNotifications<T>({
    fn,
    minLoadingNotificationMs = 1000,
    loading,
    success,
    error,
  }: WithLoadingNotificationsOptions<T>) {
    return async (...args: any) => {
      const loadingId = nanoId()
      if (loading) {
        notification({ ...loading, id: loadingId })
      }
      try {
        const [result] = await Promise.all([
          fn(...args),
          sleep(minLoadingNotificationMs),
        ])
        if (loading) {
          notifications.hide(loadingId)
        }

        if (success) {
          const opts = _.isFunction(success) ? success(result) : success
          notification(opts)
        }
        return result
      } catch (err) {
        if (loading) {
          notifications.hide(loadingId)
        }

        if (error) {
          const opts = _.isFunction(error) ? error(ensureError(err)) : error
          // Longer timeout on error
          notification({ autoClose: 6000, ...opts })
        }
        throw err
      }
    }
  }

  return {
    notification,
    withNotifications,
  }
}
