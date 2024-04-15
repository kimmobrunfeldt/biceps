import {
  Avatar,
  Box,
  Center,
  Image,
  Stack,
  Tooltip,
  UnstyledButton,
  rem,
} from '@mantine/core'
import { IconHome2, IconSalad } from '@tabler/icons-react'
import logo from 'src/assets/biceps-logo.svg'
import { Query } from 'src/components/Query'
import { useGetAppState } from 'src/hooks/useDatabase'
import { routes } from 'src/routes'
import { Link, useRoute } from 'wouter'
import classes from './NavBar.module.css'

interface NavBarLinkProps {
  label: string
  to: string
  icon?: typeof IconHome2
  children?: React.ReactNode
}

function NavBarLink({ to, icon: Icon, label, children }: NavBarLinkProps) {
  const [active] = useRoute(to)

  const getContent = () => {
    if (children) {
      return (
        <Box className={classes.linkAvatar} data-active={Boolean(active)}>
          {children}
        </Box>
      )
    } else if (Icon) {
      return (
        <UnstyledButton
          className={classes.linkButton}
          data-active={Boolean(active)}
        >
          <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        </UnstyledButton>
      )
    } else {
      throw new Error('Either icon or children must be provided')
    }
  }

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <Link to={to} className={classes.link}>
        {getContent()}
      </Link>
    </Tooltip>
  )
}

const menuItems = [
  { icon: IconHome2, label: 'Home', to: routes.index.path },
  { icon: IconSalad, label: 'Recipes', to: routes.recipes.index.path },
]

export function NavBar() {
  const appStateResult = useGetAppState()
  const links = menuItems.map((link) => (
    <NavBarLink {...link} key={link.label} to={link.to} />
  ))

  const [settingsRouteActive] = useRoute(routes.settings.path)

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

      <Stack justify="center" align="center" gap={0}>
        <NavBarLink to={routes.settings.path} label="Profile & Settings">
          <Query
            result={appStateResult}
            whenEmpty={() => null}
            whenLoading={
              <Avatar alt="Placeholder avatar" color="gray">
                {' '}
              </Avatar>
            }
          >
            {(data) => (
              <Avatar
                color={settingsRouteActive ? 'purple' : 'gray'}
                radius="xl"
                alt={data.selectedPerson.name}
              >
                {data.selectedPerson.initials}
              </Avatar>
            )}
          </Query>
        </NavBarLink>
      </Stack>
    </nav>
  )
}
