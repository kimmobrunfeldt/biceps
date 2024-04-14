// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css'

import { MantineColorsTuple, MantineProvider, createTheme } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DBProvider, useDB } from '@vlcn.io/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from 'src/Router'
import { DATABASE_NAME } from 'src/constants'
import { createLoaders } from 'src/db/dataLoaders'
import schemaContent from 'src/db/schema.sql?raw'
import { DataLoaderContext } from 'src/hooks/useDataLoaders'

const queryClient = new QueryClient()

const brandColor: MantineColorsTuple = [
  '#f5ecff',
  '#e5d4fa',
  '#c8a6f3',
  '#aa75ed',
  '#904ce7',
  '#8032e4',
  '#7825e3',
  '#6619ca',
  '#5b14b5',
  '#4e0da0',
]

const theme = createTheme({
  colors: {
    purple: brandColor,
  },
  primaryColor: 'purple',
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DBProvider
      dbname={DATABASE_NAME}
      schema={{
        name: 'schema.sql',
        content: schemaContent,
      }}
      Render={() => {
        const ctx = useDB(DATABASE_NAME)
        const dataLoaders = createLoaders(ctx.db)
        return (
          <DataLoaderContext.Provider value={dataLoaders}>
            <MantineProvider theme={theme} defaultColorScheme='dark'>
              <QueryClientProvider client={queryClient}>
                <Router />
              </QueryClientProvider>
            </MantineProvider>
          </DataLoaderContext.Provider>
        )
      }}
    />
  </React.StrictMode>
)
