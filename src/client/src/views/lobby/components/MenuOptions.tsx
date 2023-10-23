import React from "react";
import Drawer from "@mui/joy/Drawer";
import {
  List,
  ListItem,
  Sheet,
  Typography,
  ListItemButton,
  ListItemContent,
  listItemButtonClasses,
  Box,
} from "@mui/joy";
import { useKeybindsToggle } from "@hooks/keybinds";
import Link from "@components/Link";
import MessagesPanel from "./MessagesPanel";
import MessageChat from "./MessageChat";

const targets = [
  {
    label: "Home",
    target: "",
  },
  {
    label: "Settings",
    target: "/settings",
  },
  {
    label: "Messages",
    target: "/messages",
  },
  {
    label: "Key Bindings",
    target: "/keybindings",
  },
  {
    label: "Friends",
    target: "/friends",
  },
  {
    label: "Achievements",
    target: "/achievements",
  },
  {
    label: "Exit",
    target: "/exit",
  },
];

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
    <Sheet className="SideBar">
      <Drawer
        className="SideBar"
        open={open}
        onClose={handleCloseDrawer}
        slotProps={{
          content: {
            sx: {
              width: "80%",
              minHeight: 0,
              overflow: "hidden auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "row",
              bgcolor: "rgba(0, 0, 0, 0.0)",
			  
            },
          },
        }}
      >
        <Box
          sx={{
			backgroundColor: 'background.level1',
            display: "flex",
            flexDirection: "collumn",
            width: "25%",
			borderRight: '1px solid',
			borderColor: 'divider',
            [`& .${listItemButtonClasses.root}`]: {
              gap: 1.5,
            },
          }}
        >
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
                  <Typography level="title-sm" sx={{ align: "right" }}>
                    {" "}
                    Main Menu{" "}
                  </Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
            {targets.map(({ label, target }, idx) => (
              <ListItem key={idx}>
                <ListItemButton>
                  <Link href={target}>
                    <ListItemContent>
                      <Typography level="title-sm">{label}</Typography>
                    </ListItemContent>
                  </Link>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        <MessagesPanel isOpen={open}/>
		<MessageChat isOpen={open}/>
      </Drawer>
    </Sheet>
  );
}

//component={Link} href="/"
