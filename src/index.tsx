// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import initWasm, { DB, SQLite3 } from '@vlcn.io/crsqlite-wasm'
import wasmUrl from '@vlcn.io/crsqlite-wasm/crsqlite.wasm?url'
import tblrx from '@vlcn.io/rx-tbl'
import { wdbRtc } from '@vlcn.io/sync-p2p'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Router } from 'src/Router'
import { DATABASE_NAME } from 'src/constants'
import { createLoaders } from 'src/db/dataLoaders'
import { upsertSeedData } from 'src/db/seedData'
import { DataLoaderContext } from 'src/hooks/useDataLoaders'
import { DatabaseContext } from 'src/hooks/useSqlite'
import { runMigrations } from 'src/migrations'
import { EmergencyFallbackPage } from 'src/pages/errors/EmergencyFallbackPage'
import { theme } from 'src/theme'
import { stringify as uuidStringify } from 'uuid'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disables automatic retries on failed queries.
      staleTime: Infinity,
      refetchOnWindowFocus: false, // Disables automatic refetching when browser window is focused.
    },
  },
})

const UiProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-center" />
      <ModalsProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ModalsProvider>
    </MantineProvider>
  )
}

const ROOT_ELEMENT = document.getElementById('root')!

// TODO: This setup doesn't seem to work correctly with vite refreshing
async function main() {
  const crsqlite = await initWasm(() => wasmUrl)

  // In case the initialization fails, we'll close the DB connection.
  // This should close the IndexedDB connection so that in case emergency fallback page
  // data deletion is needed, the IndexedDB connection is not locked.
  await withConnectionCloseOnError(crsqlite, async (db) => {
    console.log('Connected to database:', db)

    await runMigrations(db)
    await upsertSeedData(db)

    // Copied from https://github.com/vlcn-io/live-examples/blob/main/src/todomvc-p2p/main.tsx
    const row = await db.execA('SELECT crsql_site_id()')
    const siteid = uuidStringify(row[0][0])

    const rx = await tblrx(db)
    const rtc = await wdbRtc(
      db,
      // If you want to run local peerjs server:
      // window.location.hostname === "localhost"
      //   ? {
      //       host: "localhost",
      //       port: 9000,
      //       path: "/examples",
      //     }
      // : undefined
      undefined
    )

    const dataLoaders = createLoaders(db)

    ReactDOM.createRoot(ROOT_ELEMENT).render(
      <ErrorBoundary
        fallback={
          <UiProviders>
            <EmergencyFallbackPage />
          </UiProviders>
        }
      >
        <React.StrictMode>
          <DatabaseContext.Provider value={{ db, siteid, rtc, rx }}>
            <DataLoaderContext.Provider value={dataLoaders}>
              <UiProviders>
                <Router />
              </UiProviders>
            </DataLoaderContext.Provider>
          </DatabaseContext.Provider>
        </React.StrictMode>
      </ErrorBoundary>
    )
  })
}

async function withConnectionCloseOnError(
  crsqlite: SQLite3,
  callback: (db: DB) => Promise<void>
) {
  let db: DB | undefined
  try {
    db = await crsqlite.open(DATABASE_NAME)
    await callback(db)
  } catch (err) {
    if (db) {
      await closeAndIgnoreErrors(db)
    }
    throw err
  }
}

async function closeAndIgnoreErrors(db: DB) {
  try {
    await db.close()
  } catch (err) {
    console.error('Error closing database:', err)
    console.log('Ignoring error and continuing ...')
  }
}

void main().catch(async (err) => {
  console.error('Error initializing app:', err)

  ReactDOM.createRoot(ROOT_ELEMENT).render(
    <UiProviders>
      <EmergencyFallbackPage />
    </UiProviders>
  )
})
