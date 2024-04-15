import { Box, Button, Container, Group, Text, Title } from '@mantine/core'
import classes from 'src/pages/NotFoundPage.module.css'
import { routes } from 'src/routes'
import { Link } from 'wouter'

export function NotFoundPage() {
  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <Box>
          <Text className={classes.background}>404</Text>
        </Box>

        <div className={classes.content}>
          <Title className={classes.title}>Nothing here</Title>
          <Text
            c="dimmed"
            size="lg"
            ta="center"
            className={classes.description}
          >
            Page you are trying to open does not exist. You may have mistyped
            the address, or the page has been moved to another URL.
          </Text>
          <Group justify="center">
            <Link to={routes.index.path}>
              <Button size="md">Take me back to home page</Button>
            </Link>
          </Group>
        </div>
      </div>
    </Container>
  )
}
