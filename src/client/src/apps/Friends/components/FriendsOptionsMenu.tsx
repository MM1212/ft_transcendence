import AccountIcon from "@components/icons/AccountIcon";
import AccountRemoveIcon from "@components/icons/AccountRemoveIcon";
import DotsVerticalIcon from "@components/icons/DotsVerticalIcon";
import TableTennisIcon from "@components/icons/TableTennisIcon";
import { IconButton, ListItemDecorator } from "@mui/joy";
import { styled } from "@mui/joy";
import { MenuItem } from "@mui/joy";
import { Dropdown, Menu, MenuButton } from "@mui/joy";
import useFriend from "../hooks/useFriend";
import AccountCancelIcon from "@components/icons/AccountCancelIcon";
import Link from "@components/Link";

const IconButtonRounded = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.radius.xl,
}));

export default function FriendsOptionsMenu({ id }: { id: number }) {
  const { remove } = useFriend(id);
  const { block } = useFriend(id);
  const { sendPongInvite } = useFriend(id);

  const forwardPropagation =
    (cb?: () => void) => (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      cb?.();
    };

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButtonRounded }}
        slotProps={{ root: { variant: "plain", color: "neutral" } }}
        onClick={(e) => e.stopPropagation()}
      >
        <DotsVerticalIcon />
      </MenuButton>
      <Menu>
        <MenuItem
          component={Link}
          to={`/profile/${id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <ListItemDecorator>
            <AccountIcon />
          </ListItemDecorator>
          Profile
        </MenuItem>
        <MenuItem onClick={forwardPropagation(sendPongInvite)}>
          <ListItemDecorator>
            <TableTennisIcon />
          </ListItemDecorator>
          Invite to Pong
        </MenuItem>
        <MenuItem onClick={forwardPropagation(remove)} color="danger">
          <ListItemDecorator>
            <AccountRemoveIcon />
          </ListItemDecorator>
          Remove
        </MenuItem>
        <MenuItem onClick={forwardPropagation(block)} color="danger">
          <ListItemDecorator>
            <AccountCancelIcon />
          </ListItemDecorator>
          Block
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}
