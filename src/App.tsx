import { AppShell, Box, Burger, Group, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { NavLink } from 'src/components/NavLink'
import { appName, routes } from 'src/routes'

export function App({ children }: { children?: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Box>{appName}</Box>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack gap="xl">
          <Stack>
            <NavLink to={routes.index.path}>Recipes</NavLink>
          </Stack>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
