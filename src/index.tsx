// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DBProvider, useDB } from '@vlcn.io/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from 'src/Router'
import { DATABASE_NAME } from 'src/constants'
import { createLoaders } from 'src/db/dataLoaders'
import schemaContent from 'src/db/schema.sql?raw'
import { upsertSeedData } from 'src/db/seedData'
import { DataLoaderContext } from 'src/hooks/useDataLoaders'
import { runMigrations } from 'src/migrations'
import { EmergencyFallbackPage } from 'src/pages/errors/EmergencyFallbackPage'
import { theme } from 'src/theme'

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

async function main() {
  try {
    await runMigrations()
  } catch (err) {
    console.error('Error running migrations:', err)
  }

  await ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <DBProvider
        dbname={DATABASE_NAME}
        schema={{
          name: DATABASE_NAME,
          content: schemaContent,
        }}
        manualSetup={async (ctx) => {
          await upsertSeedData(ctx.db)
        }}
        fallback={
          <UiProviders>
            <EmergencyFallbackPage />
          </UiProviders>
        }
        Render={() => {
          const ctx = useDB(DATABASE_NAME)
          const dataLoaders = ctx ? createLoaders(ctx.db) : undefined
          return (
            <DataLoaderContext.Provider value={dataLoaders}>
              <UiProviders>{ctx ? <Router /> : null}</UiProviders>
            </DataLoaderContext.Provider>
          )
        }}
      />
    </React.StrictMode>
  )
}

void main()
