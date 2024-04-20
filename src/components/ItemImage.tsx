import {
  Avatar,
  AvatarProps,
  Image,
  PolymorphicComponentProps,
  Popover,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconSalad } from '@tabler/icons-react'
import { ItemResolvedBeforeSaving } from 'src/db/schemas/ItemSchema'
import classes from './ItemImage.module.css'

type Props = {
  item?: Pick<ItemResolvedBeforeSaving, 'imageThumbUrl' | 'imageUrl'>
} & PolymorphicComponentProps<'div', AvatarProps>

export function ItemImage({ item, ...rest }: Props) {
  const [opened, { close, open }] = useDisclosure(false)

  const avatar = (
    <Avatar
      onMouseEnter={open}
      onMouseLeave={close}
      src={item ? item.imageThumbUrl : null}
      alt=""
      size="md"
      radius="sm"
      className={classes.itemImage}
      {...rest}
    >
      <IconSalad opacity={0.7} />
    </Avatar>
  )

  if (!item?.imageUrl) return avatar

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
          src={item?.imageUrl}
          maw={300}
          fallbackSrc="https://placehold.co/100x100?text=No image"
        />
      </Popover.Dropdown>
    </Popover>
  )
}
