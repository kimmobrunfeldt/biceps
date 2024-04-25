import {
  Avatar,
  Box,
  Burger,
  Center,
  Flex,
  Image,
  Menu,
  Stack,
  Tooltip,
  UnstyledButton,
  rem,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCalendarWeek,
  IconHome2,
  IconNetwork,
  IconSalad,
  IconShoppingBag,
  IconUser,
} from '@tabler/icons-react'
import logo from 'src/assets/biceps-logo.svg'
import { Query } from 'src/components/Query'
import { useGetAppState } from 'src/hooks/useDatabase'
import { useRtc } from 'src/hooks/useSqlite'
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
  { icon: IconHome2, label: routes.index.title, to: routes.index.path },
  {
    icon: IconCalendarWeek,
    label: routes.weeklySchedule.index.title,
    to: routes.weeklySchedule.index.path,
  },
  {
    icon: IconSalad,
    label: routes.recipes.index.title,
    to: routes.recipes.index.path,
  },
  {
    icon: IconShoppingBag,
    label: routes.products.index.title,
    to: routes.products.index.path,
  },
]

export function NavBar() {
  const { established } = useRtc()
  const appStateResult = useGetAppState()
  const [opened, { toggle }] = useDisclosure()
  const links = menuItems.map((link) => (
    <NavBarLink {...link} key={link.label} to={link.to} />
  ))

  const [settingsRouteActive] = useRoute(routes.settings.path)

  const syncIcon =
    established.length > 0 ? (
      <Tooltip label={`Syncing data with ${established[0]}`}>
        <Box c="green">
          <IconNetwork />
        </Box>
      </Tooltip>
    ) : null

  return (
    <>
      {/* Left side menu */}
      <Box component="nav" className={classes.navbar} visibleFrom="sm">
        <Center>
          <Image src={logo} w={30} />
        </Center>

        <Box className={classes.navbarMain}>
          <Stack justify="center" gap={0}>
            {links}
          </Stack>
        </Box>

        <Stack justify="center" align="center" gap="sm">
          {syncIcon}

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
              {(data) => {
                return (
                  <Avatar
                    color={settingsRouteActive ? 'blue' : 'gray'}
                    radius="xl"
                    alt={data.selectedPerson.name}
                  >
                    {data.selectedPerson.initials}
                  </Avatar>
                )
              }}
            </Query>
          </NavBarLink>
        </Stack>
      </Box>

      {/* Burger menu */}
      <Flex
        pos="fixed"
        right={20}
        bottom={20}
        hiddenFrom="sm"
        style={{ zIndex: 100 }}
        className={classes.burgerMenuContainer}
        direction="column"
        align="center"
        gap={6}
      >
        {syncIcon}
        <Menu opened={opened} onChange={toggle} shadow="md" width={200}>
          <Menu.Target>
            <Flex
              bg="primary"
              style={{ borderRadius: '99999px' }}
              w={44}
              h={44}
              justify="center"
              align="center"
            >
              <Burger
                color="white"
                opened={opened}
                onClick={toggle}
                aria-label="Toggle navigation"
                size="sm"
              />
            </Flex>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Application</Menu.Label>
            {menuItems.map(({ icon: Icon, label, to }) => {
              return (
                <Link key={to} href={to} className={classes.burgerMenuLink}>
                  <Menu.Item
                    leftSection={
                      <Icon style={{ width: rem(14), height: rem(14) }} />
                    }
                  >
                    {label}
                  </Menu.Item>
                </Link>
              )
            })}

            <Menu.Divider />

            <Menu.Label>Settings</Menu.Label>
            <Link
              href={routes.settings.path}
              className={classes.burgerMenuLink}
            >
              <Menu.Item
                leftSection={
                  <IconUser style={{ width: rem(14), height: rem(14) }} />
                }
              >
                Profile
              </Menu.Item>
            </Link>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </>
  )
}
