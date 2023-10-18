import React from "react";
import Drawer from "@mui/joy/Drawer";
import {
  List,
  ListItem,
  Sheet,
  Typography,
  ListItemButton,
  ListItemContent,
  Chip,
  listItemButtonClasses,
} from "@mui/joy";
import { useKeybindsToggle } from "@hooks/keybinds";

export default function DrawerCloseButton() {
  const [open, setOpen] = React.useState(false);

  const handleCloseDrawer = () => {
    setOpen(false);
  };
  const handleOpenDrawer = React.useCallback(
    (key: string, pressed: boolean) => {
      if (!pressed) return;
      if (key !== "Escape") return;
      setOpen((prev) => !prev);
    },
    [setOpen]
  );

  const listItemStyles = {
    display: "flex",
    bgcolor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    p: 1,
    width: "100%",
  };

  useKeybindsToggle(["Escape"], handleOpenDrawer, []);

  return (
    <Sheet
      className="SideBar"
      sx={{
        position: "absolute",
        height: "100%",
        width: "100%",
        bgcolor: "rgba(51,51,51, 0.0)",
      }}
    >
      <Drawer
        open={open}
        onClose={handleCloseDrawer}
        slotProps={{
          content: {
            sx: {
				width: '20%',
				minHeight: 0,
				overflow: 'hidden auto',
				flexGrow: 1,
				display: 'flex',
				flexDirection: 'column',
              [`& .${listItemButtonClasses.root}`]: {
                gap: 1.5,
              },
            },
          },
        }}
      >
        <Typography
          sx={{
            listItemStyles,
            alignSelf: "center",
          }}
        >
          Game Menu
        </Typography>
        <List
          size="sm"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
          }}
        >
          <ListItem>
            <ListItemButton>
              <ListItemContent>
                <Typography level="title-sm">Home</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemContent>
                <Typography level="title-sm">Options</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemContent >
                <Typography level="title-sm">Messages</Typography>
              </ListItemContent>
              <Chip size="sm" color="primary" variant="solid">
                4
              </Chip>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemContent>
                <Typography level="title-sm">Key Bindings</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemContent>
                <Typography level="title-sm">Friends</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemContent>
                <Typography level="title-sm">Achievements</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemContent>
                <Typography level="title-sm">Exit</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Sheet>
  );
}

//component={Link} href="/"
