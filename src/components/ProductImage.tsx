import {
  Avatar,
  AvatarProps,
  Image,
  PolymorphicComponentProps,
  Popover,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconSalad } from '@tabler/icons-react'
import { ProductResolvedBeforeSaving } from 'src/db/schemas/ProductSchema'
import classes from './ProductImage.module.css'

type Props = {
  product?: Pick<ProductResolvedBeforeSaving, 'imageThumbUrl' | 'imageUrl'>
} & PolymorphicComponentProps<'div', AvatarProps>

export function ProductImage({ product, ...rest }: Props) {
  const [opened, { close, open }] = useDisclosure(false)

  const avatar = (
    <Avatar
      onMouseEnter={open}
      onMouseLeave={close}
      src={product ? product.imageThumbUrl : null}
      alt=""
      size="md"
      radius="sm"
      className={classes.itemImage}
      {...rest}
    >
      <IconSalad opacity={0.7} />
    </Avatar>
  )

  if (!product?.imageUrl) return avatar

  return (
    <Popover
      width={200}
      position="bottom"
      withArrow
      shadow="md"
      opened={opened}
    >
      <Popover.Target>{avatar}</Popover.Target>
      <Popover.Dropdown style={{ pointerEvents: 'none' }}>
        <Image
          src={product?.imageUrl}
          maw={300}
          fallbackSrc="https://placehold.co/100x100?text=No image"
        />
      </Popover.Dropdown>
    </Popover>
  )
}
