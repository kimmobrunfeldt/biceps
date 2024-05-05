import React from 'react'
import { useSearch, Link as WouterLink } from 'wouter'

type Props = {
  className?: string
  children?: React.ReactNode
} & ({ to: string } | { href: string })

export const Link = React.forwardRef<HTMLAnchorElement, Props>((props, ref) => {
  const search = useSearch()

  function getLinkProps() {
    if ('to' in props) {
      const { to, ...rest } = props
      const toWithSearch = search ? `${to}?${search}` : to
      return { to: toWithSearch, ...rest }
    }

    return props
  }

  return <WouterLink {...getLinkProps()} ref={ref} />
})
Link.displayName = 'Link'
