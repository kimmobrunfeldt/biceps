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
    title: 'Today',
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
    add: {
      path: '/products/add',
      title: 'Add product',
    },
    import: {
      path: '/products/import',
      title: 'Import products',
    },
    edit: {
      path: '/products/edit/:id',
      title: 'Edit product',
    },
  },
  weeklySchedule: {
    index: {
      path: '/weekly-schedule',
      title: 'Weekly Schedule',
    },
    add: {
      path: '/weekly-schedule/add',
      title: 'Add recurring event',
    },
  },
  settings: {
    path: '/settings',
    title: 'Profile & Settings',
  },
}
