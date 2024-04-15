import { Box, Flex, ScrollArea } from '@mantine/core'
import { NavBar } from 'src/components/NavBar'

import 'src/App.css'

export function App({ children }: { children?: React.ReactNode }) {
  return (
    <Flex w="100%" h="100%">
      <NavBar />
      <Box flex={1} p="xl">
        <ScrollArea w="100%" h="100%">
          {children}
        </ScrollArea>
      </Box>
    </Flex>
  )
}
