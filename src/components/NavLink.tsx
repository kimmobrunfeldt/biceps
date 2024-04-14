import { UnstyledButton } from '@mantine/core'
import { Link, useRoute } from 'wouter'

type NavLinkProps = {
  to: string
  children: React.ReactNode
}
export function NavLink({ to, children }: NavLinkProps) {
  const [isActive] = useRoute(to)
  return (
    <Link href={to}>
      <UnstyledButton>{children}</UnstyledButton>
    </Link>
  )
}
