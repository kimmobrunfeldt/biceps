import {
  Box,
  Center,
  Image,
  Stack,
  Tooltip,
  UnstyledButton,
  rem,
} from '@mantine/core'
import { IconHome2, IconSalad, IconSettings } from '@tabler/icons-react'
import logo from 'src/assets/biceps-logo.svg'
import { routes } from 'src/routes'
import { Link, useRoute } from 'wouter'
import classes from './NavBar.module.css'

interface NavBarLinkProps {
  icon: typeof IconHome2
  label: string
  to: string
}

function NavBarLink({ to, icon: Icon, label }: NavBarLinkProps) {
  const [active] = useRoute(to)
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <Link to={to}>
        <UnstyledButton
          className={classes.link}
          data-active={active || undefined}
        >
          <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        </UnstyledButton>
      </Link>
    </Tooltip>
  )
}

const menuItems = [
  { icon: IconHome2, label: 'Home', to: routes.index.path },
  { icon: IconSalad, label: 'Recipes', to: routes.recipes.index.path },
  { icon: IconSettings, label: 'Settings', to: routes.settings.path },
]

export function NavBar() {
  const links = menuItems.map((link) => (
    <NavBarLink {...link} key={link.label} to={link.to} />
  ))

  return (
    <nav className={classes.navbar}>
      <Center>
        <Image src={logo} w={30} />
      </Center>

      <Box className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </Box>

      <Stack justify="center" gap={0}>
        {/*
        <NavBarLink icon={IconLogout} label="Logout" />
        */}
      </Stack>
    </nav>
  )
}
