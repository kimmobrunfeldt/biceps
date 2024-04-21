const breakpoints = require('./src/breakpoints.json');

module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': breakpoints['xs'],
        'mantine-breakpoint-sm': breakpoints['sm'],
        'mantine-breakpoint-md': breakpoints['md'],
        'mantine-breakpoint-lg': breakpoints['lg'],
        'mantine-breakpoint-xl': breakpoints['xl'],
      },
    },
  },
};

