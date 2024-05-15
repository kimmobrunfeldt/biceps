// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

import { Blockquote, Box, Loader, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import initWasm, { DB, SQLite3 } from '@vlcn.io/crsqlite-wasm'
import wasmUrl from '@vlcn.io/crsqlite-wasm/crsqlite.wasm?url'
import tblrx from '@vlcn.io/rx-tbl'
import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Router } from 'src/Router'
import { DELETE_ALL_DATA_QUERY_PARAM } from 'src/components/DeleteAllDataLink'
import { PageTemplate } from 'src/components/PageTemplate'
import { DATABASE_NAME, IMPORT_DATA_QUERY_PARAM } from 'src/constants'
import { createLoaders } from 'src/db/dataLoaders'
import { allEntities } from 'src/db/entities'
import { upsertSeedData } from 'src/db/seedData'
import { DataLoaderContext } from 'src/hooks/useDataLoaders'
import { DatabaseContext } from 'src/hooks/useSqlite'
import { runMigrations } from 'src/migrations'
import { ImportDataPage } from 'src/pages/ImportDataPage'
import { DeleteAllDataRequestedPage } from 'src/pages/errors/DataAllDataRequestedPage'
import { EmergencyFallbackPage } from 'src/pages/errors/EmergencyFallbackPage'
import { theme } from 'src/theme'
import { getLogger } from 'src/utils/logger'
import { wdbRtc } from 'src/utils/p2p'
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

const logger = getLogger('main')

// TODO: This setup doesn't seem to work correctly with vite refreshing
async function main() {
  if (window.location.search === `?${DELETE_ALL_DATA_QUERY_PARAM}=true`) {
    // Render data deletion page before connecting to database
    ReactDOM.createRoot(ROOT_ELEMENT).render(
      <UiProviders>
        <DeleteAllDataRequestedPage />
      </UiProviders>
    )
    return
  } else if (window.location.search === `?${IMPORT_DATA_QUERY_PARAM}=true`) {
    // Render data deletion page before connecting to database
    ReactDOM.createRoot(ROOT_ELEMENT).render(
      <UiProviders>
        <ImportDataPage />
      </UiProviders>
    )
    return
  }

  const crsqlite = await initWasm(() => wasmUrl)

  // In case the initialization fails, we'll close the DB connection.
  // This should close the IndexedDB connection so that in case emergency fallback page
  // data deletion is needed, the IndexedDB connection is not locked.
  await withConnectionCloseOnError(crsqlite, async (db) => {
    logger.info('Connected to database:', db)
    logger.info(
      `Use the SQLite database with: await sql('SELECT * FROM products')`
    )
    logger.info(`or: await Recipe.findMany()`)
    ;(window as any).sql = (sql: string) => db.execO(sql)

    const entitiesWithConnection = _.mapValues(allEntities, (Entity) => {
      return _.mapValues(Entity, (val) => {
        if (!_.isFunction(val)) {
          return val
        }
        return async (params: Record<string, any> = {}) => {
          return await val({ connection: db, ...params } as any)
        }
      })
    })

    for (const key of Object.keys(entitiesWithConnection)) {
      // eslint-disable-next-line no-extra-semi
      ;(window as any)[key] = (entitiesWithConnection as any)[key]
    }

    const root = ReactDOM.createRoot(ROOT_ELEMENT)
    root.render(
      <UiProviders>
        <PageTemplate title="Initializing app">
          <Box mt="lg">
            <Blockquote icon={<Loader size="sm" />}>
              Prepping protein shakes ...
            </Blockquote>
          </Box>
        </PageTemplate>
      </UiProviders>
    )
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
    root.render(
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
    logger.error('Error closing database:', err)
    logger.info('Ignoring error and continuing ...')
  }
}

void main().catch(async (err) => {
  logger.error('Error initializing app:', err)

  ReactDOM.createRoot(ROOT_ELEMENT).render(
    <UiProviders>
      <EmergencyFallbackPage />
    </UiProviders>
  )
})
