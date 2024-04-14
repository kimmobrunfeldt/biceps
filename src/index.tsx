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

const myColor: MantineColorsTuple = [
  '#f6eeff',
  '#e7daf7',
  '#cab1ea',
  '#ad86dd',
  '#9562d2',
  '#854bcb',
  '#7d3ec9',
  '#6b31b2',
  '#5f2aa0',
  '#52228d',
]

const theme = createTheme({
  colors: {
    myColor,
  },
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
            <MantineProvider theme={theme}>
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
