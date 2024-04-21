import { MantineColorsTuple, createTheme, virtualColor } from '@mantine/core'
import breakpoints from 'src/breakpoints.json'

const brandColor: MantineColorsTuple = [
  '#f5ecff',
  '#e5d4fa',
  '#c8a6f3',
  '#aa75ed',
  '#904ce7',
  '#8032e4',
  '#7825e3',
  '#6619ca',
  '#5b14b5',
  '#4e0da0',
]

export const theme = createTheme({
  colors: {
    purple: brandColor,
    primary: virtualColor({
      name: 'primary',
      dark: 'blue',
      light: 'blue',
    }),
  },
  primaryColor: 'blue',
  breakpoints,
})
