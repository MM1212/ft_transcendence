import { MenuItemProps, MenuItem, ListItemDecorator } from '@mui/joy';

export default function MenuOption({
  icon: Icon,
  children,
  ...props
}: Omit<MenuItemProps, 'children'> & {
  icon?: React.ComponentType;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <MenuItem {...props}>
      {Icon && (
        <ListItemDecorator>
          <Icon />
        </ListItemDecorator>
      )}
      {children}
    </MenuItem>
  );
}
