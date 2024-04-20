import { App } from 'src/App'
import { AddProductPage } from 'src/pages/AddProductPage/AddProductPage'
import { AddRecipePage } from 'src/pages/AddRecipePage/AddRecipePage'
import { EditRecipePage } from 'src/pages/EditRecipePage/EditRecipePage'
import { IndexPage } from 'src/pages/IndexPage/IndexPage'
import { NotFoundPage } from 'src/pages/NotFoundPage'
import { ProductsPage } from 'src/pages/ProductsPage/ProductsPage'
import { RecipesPage } from 'src/pages/RecipesPage/RecipesPage'
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
        <Route<{ id: string }> path={routes.recipes.edit.path}>
          {(params) => <EditRecipePage id={params.id} />}
        </Route>

        <Route path={routes.products.index.path} component={ProductsPage} />
        <Route path={routes.products.add.path} component={AddProductPage} />

        <Route
          path={routes.weeklySchedule.index.path}
          component={WeeklySchedulePage}
        />
        <Route path={routes.settings.path} component={SettingsPage} />

        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
    </App>
  )
}
