export const appName = 'Biceps'

const makeTitle = (title: string) => `${title} | ${appName}`

export const routes = {
  index: {
    path: '/',
    title: appName,
  },
  recipes: {
    index: {
      path: '/recipes',
      title: makeTitle('Recipes'),
    },
    add: {
      path: '/add',
      title: makeTitle('Add recipe'),
    },
  },
  settings: {
    path: '/settings',
    title: makeTitle('Settings'),
  },
}
