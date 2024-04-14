import { Box, Flex } from '@mantine/core'
import 'src/App.module.css'
import { NavBar } from 'src/components/NavBar'

export function App({ children }: { children?: React.ReactNode }) {
  return (
    <Flex w="100%" h="100%">
      <NavBar />
      <Box flex={1} p={"xl"}>{children}</Box>
    </Flex>
  )
}
