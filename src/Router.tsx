import { App } from 'src/App'
import { IndexPage } from 'src/pages/IndexPage'
import { NotFoundPage } from 'src/pages/NotFoundPage'
import { RecipesPage } from 'src/pages/RecipesPage'
import { SettingsPage } from 'src/pages/SettingsPage/SettingsPage'
import { Route, Switch } from 'wouter'

export function Router() {
  return (
    <App>
      <Switch>
        <Route path="/" component={IndexPage} />
        <Route path="/recipes" component={RecipesPage} />
        <Route path="/settings" component={SettingsPage} />

        {/* Default route in a switch */}
        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
    </App>
  )
}
