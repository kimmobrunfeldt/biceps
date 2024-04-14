import { useDB } from '@vlcn.io/react'
import { App } from 'src/App'
import { DATABASE_NAME } from 'src/constants'
import { AddRecipePage } from 'src/pages/AddRecipePage'
import { Route, Switch } from 'wouter'

export function Router() {
  const ctx = useDB(DATABASE_NAME)

  if (!ctx) {
    return <App>Connecting to database ...</App>
  }

  return (
    <App>
      <Switch>
        <Route path="/" component={AddRecipePage} />

        {/* Default route in a switch */}
        <Route>404: No such page!</Route>
      </Switch>
    </App>
  )
}
