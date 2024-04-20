import { App } from 'src/App'
import { IndexPage } from 'src/pages/IndexPage/IndexPage'
import { SettingsPage } from 'src/pages/SettingsPage/SettingsPage'
import { WeeklySchedulePage } from 'src/pages/WeeklySchedulePage/WeeklySchedulePage'
import { NotFoundPage } from 'src/pages/errors/NotFoundPage'
import { AddProductPage } from 'src/pages/products/AddProductPage/AddProductPage'
import { ProductsPage } from 'src/pages/products/ProductsPage/ProductsPage'
import { AddRecipePage } from 'src/pages/recipes/AddRecipePage/AddRecipePage'
import { EditRecipePage } from 'src/pages/recipes/EditRecipePage/EditRecipePage'
import { RecipesPage } from 'src/pages/recipes/RecipesPage/RecipesPage'
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
