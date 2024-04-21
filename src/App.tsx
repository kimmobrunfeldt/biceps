import { Box, Flex } from '@mantine/core'
import { NavBar } from 'src/components/NavBar'

import 'src/App.css'

export function App({ children }: { children?: React.ReactNode }) {
  return (
    <Flex w="100%" h="100%">
      <NavBar />

      <Box flex={1} miw={0} style={{ overflow: 'hidden auto' }}>
        <Box>{children}</Box>
      </Box>
    </Flex>
  )
}
