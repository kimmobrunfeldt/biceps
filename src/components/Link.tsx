import React from 'react'
import { useSearch, Link as WouterLink } from 'wouter'

type Props = {
  to: string
  className?: string
  children?: React.ReactNode
}

export const Link = React.forwardRef<HTMLAnchorElement, Props>((props, ref) => {
  const search = useSearch()
  const { to, ...rest } = props
  const toWithSearch = search ? `${to}?${search}` : to
  return <WouterLink to={toWithSearch} {...rest} ref={ref} />
})
Link.displayName = 'Link'
