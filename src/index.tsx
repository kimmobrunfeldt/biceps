// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css'

import { MantineColorsTuple, MantineProvider, createTheme } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DBProvider } from '@vlcn.io/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter } from 'react-router-dom'
import { App } from 'src/App'
import { DATABASE_NAME } from 'src/constants'
import schemaContent from 'src/db/schema.sql?raw'
import { AddRecipePage } from 'src/pages/AddRecipePage'

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

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <AddRecipePage />,
      },
      {
        path: '/recipes/add',
        element: <AddRecipePage />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DBProvider
      dbname={DATABASE_NAME}
      schema={{
        name: 'schema.sql',
        content: schemaContent,
      }}
      Render={() => (
        <MantineProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <AddRecipePage />
          </QueryClientProvider>
        </MantineProvider>
      )}
    />
  </React.StrictMode>
)
