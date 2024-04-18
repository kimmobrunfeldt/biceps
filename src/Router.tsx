import { App } from 'src/App'
import { AddRecipePage } from 'src/pages/AddRecipePage/AddRecipePage'
import { IndexPage } from 'src/pages/IndexPage/IndexPage'
import { NotFoundPage } from 'src/pages/NotFoundPage'
import { RecipesPage } from 'src/pages/RecipesPage'
import { SettingsPage } from 'src/pages/SettingsPage/SettingsPage'
import { WeeklySchedulePage } from 'src/pages/WeeklySchedulePage/WeeklySchedulePage'
import { routes } from 'src/routes'
import { Route, Switch } from 'wouter'

export function Router() {
  return (
    <App>
      <Switch>
        <Route path={routes.index.path} component={IndexPage} />
        <Route path={routes.recipes.index.path} component={RecipesPage} />
        <Route path={routes.recipes.add.path} component={AddRecipePage} />

        <Route
          path={routes.weeklySchedule.index.path}
          component={WeeklySchedulePage}
        />
        <Route path={routes.settings.path} component={SettingsPage} />

        {/* Default route in a switch */}
        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
    </App>
  )
}
