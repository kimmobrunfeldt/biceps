import { useDB } from '@vlcn.io/react'
import { App } from 'src/App'
import { DATABASE_NAME } from 'src/constants'
import { IndexPage } from 'src/pages/IndexPage'
import { NotFoundPage } from 'src/pages/NotFoundPage'
import { AddRecipePage } from 'src/pages/RecipesPage'
import { Route, Switch } from 'wouter'

export function Router() {
  const ctx = useDB(DATABASE_NAME)

  if (!ctx) {
    return <App>Connecting to database ...</App>
  }

  return (
    <App>
      <Switch>
        <Route path="/" component={IndexPage} />
        <Route path="/recipes" component={AddRecipePage} />

        {/* Default route in a switch */}
        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
    </App>
  )
}
