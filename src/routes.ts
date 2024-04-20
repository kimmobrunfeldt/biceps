export const appName = 'Biceps'

export function formatRoute(
  route: string,
  params: Record<string, any>
): string {
  return Object.keys(params).reduce((acc, key) => {
    return acc.replace(`:${key}`, params[key])
  }, route)
}

export const routes = {
  index: {
    path: '/',
    title: 'Home',
  },
  recipes: {
    index: {
      path: '/recipes',
      title: 'Recipes',
    },
    add: {
      path: '/recipes/add',
      title: 'Add recipe',
    },
    edit: {
      path: '/recipes/edit/:id',
      title: 'Edit recipe',
    },
  },
  products: {
    index: {
      path: '/products',
      title: 'Products',
    },
  },
  weeklySchedule: {
    index: {
      path: '/weekly-schedule',
      title: 'Weekly Schedule',
    },
  },
  settings: {
    path: '/settings',
    title: 'Profile & Settings',
  },
}
