import {
  Avatar,
  Badge,
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
  IconNetworkOff,
  IconSalad,
  IconShoppingBag,
  IconUser,
} from '@tabler/icons-react'
import _ from 'lodash'
import logo from 'src/assets/biceps-logo.svg'
import { Link } from 'src/components/Link'
import { Query } from 'src/components/Query'
import { useGetAppState } from 'src/hooks/useDatabase'
import { useRtc } from 'src/hooks/useSqlite'
import { routes } from 'src/routes'
import { useRoute } from 'wouter'
import classes from './NavBar.module.css'

interface NavBarLinkProps {
  label: string
  to: string
  icon?: typeof IconHome2
  children?: React.ReactNode
  showBadge?: boolean
}

function NavBarLink({
  to,
  icon: Icon,
  label,
  children,
  showBadge = false,
}: NavBarLinkProps) {
  const [active] = useRoute(to)

  const getContent = () => {
    if (children) {
      if (showBadge) throw new Error('showBadge is not supported with children')

      return (
        <Box className={classes.linkAvatar} data-active={Boolean(active)}>
          {children}
        </Box>
      )
    } else if (Icon) {
      return (
        <Box pos="relative">
          {showBadge ? (
            <Badge size="xs" circle pos="absolute" top={2} right={2}>
              1
            </Badge>
          ) : null}
          <UnstyledButton
            className={classes.linkButton}
            data-active={Boolean(active)}
          >
            <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
          </UnstyledButton>
        </Box>
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
  const { established, pending } = useRtc()
  const appStateResult = useGetAppState()
  const [opened, { toggle }] = useDisclosure()

  const showOnboardingBadge =
    !_.isUndefined(appStateResult.data?.onboardingState) &&
    appStateResult.data.onboardingState !== 'Completed'
  const links = menuItems.map((link) => {
    const showBadge = link.to === routes.index.path && showOnboardingBadge
    return (
      <NavBarLink
        {...link}
        key={link.label}
        to={link.to}
        showBadge={showBadge}
      />
    )
  })

  const [settingsRouteActive] = useRoute(routes.settings.path)

  function getSyncIcon() {
    if (established.length > 0) {
      return (
        <Tooltip label={`Syncing data with ${established[0]}`}>
          <Box c="green">
            <IconNetwork />
          </Box>
        </Tooltip>
      )
    } else if (pending.length > 0) {
      return (
        <Tooltip label={`Connection pending to ${established[0]}`}>
          <Box c="gray">
            <IconNetworkOff />
          </Box>
        </Tooltip>
      )
    } else {
      return null
    }
  }

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
          {getSyncIcon()}

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
                    alt={data.selectedPerson?.name}
                  >
                    {data.selectedPerson?.initials}
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
        {getSyncIcon()}
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
            <Menu.Label>Pages</Menu.Label>
            {menuItems.map(({ icon: Icon, label, to }) => {
              const showBadge = to === routes.index.path && showOnboardingBadge
              return (
                <Link key={to} to={to} className={classes.burgerMenuLink}>
                  <Menu.Item
                    leftSection={
                      <Icon style={{ width: rem(14), height: rem(14) }} />
                    }
                    rightSection={
                      showBadge ? (
                        <Badge size="xs" circle>
                          1
                        </Badge>
                      ) : undefined
                    }
                  >
                    {label}
                  </Menu.Item>
                </Link>
              )
            })}

            <Menu.Divider />

            <Menu.Label>Settings</Menu.Label>
            <Link to={routes.settings.path} className={classes.burgerMenuLink}>
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
