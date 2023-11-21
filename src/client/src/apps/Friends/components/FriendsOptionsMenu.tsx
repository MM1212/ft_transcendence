import AccountIcon from "@components/icons/AccountIcon";
import AccountRemoveIcon from "@components/icons/AccountRemoveIcon";
import DotsVerticalIcon from "@components/icons/DotsVerticalIcon";
import TableTennisIcon from "@components/icons/TableTennisIcon";
import { IconButton, ListItemDecorator } from "@mui/joy";
import { styled } from "@mui/joy";
import { MenuItem } from "@mui/joy";
import { Dropdown, Menu, MenuButton } from "@mui/joy";
import useFriend from "../hooks/useFriend";

const IconButtonRounded = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.radius.xl,
}));

export default function FriendsOptionsMenu({ id }: { id: number }) {
  const { remove } = useFriend(id);
  const { block } = useFriend(id);
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButtonRounded }}
        slotProps={{ root: { variant: "plain", color: "neutral" } }}
      >
        <DotsVerticalIcon />
      </MenuButton>
      <Menu
        placement="right-start"
        size="sm"
        sx={{
          zIndex: 1300,
        }}
      >
        <MenuItem>
          <ListItemDecorator>
            <AccountIcon />
          </ListItemDecorator>
          Profile
        </MenuItem>
        <MenuItem>
          <ListItemDecorator>
            <TableTennisIcon />
          </ListItemDecorator>
          Invite to Pong
        </MenuItem>
        <MenuItem
          onClick={remove}
          color="danger"
        >
          <ListItemDecorator>
            <AccountRemoveIcon />
          </ListItemDecorator>
          Remove Friend
        </MenuItem>
        <MenuItem
          onClick={block}
          color="danger"
        >
          <ListItemDecorator>
            <AccountRemoveIcon />
          </ListItemDecorator>
          Block Friend
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}
