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
import { Route, Router, Switch } from "wouter";
import { mainTargets } from "../types";
import { navigate } from "wouter/use-location";
import { useRecoilState } from "recoil";
import { sessionAtom, useSession } from "@hooks/user";

export default function DrawerCloseButton() {
  const [open, setOpen] = React.useState(false);
  const [me, setMe] = useRecoilState(sessionAtom);
  const { user } = useSession();
  if (user) setMe(user);
  const handleCloseDrawer = () => {
    setOpen(false);
    navigate("/lobby");
  };
  const handleOpenDrawer = React.useCallback(
    (key: string, pressed: boolean) => {
      if (!pressed) return;
      if (key !== "Escape") return;
      setOpen((prev) => !prev);
    },
    [setOpen]
  );
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
              boxShadow: "none",
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
        <>{console.log("mounted")}</>
        <Box
          sx={{
            backgroundColor: "background.level1",
            display: "flex",
            flexDirection: "collumn",
            width: "25%",
            borderRight: "1px solid",
            borderColor: "divider",
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
            {mainTargets.map(({ label, target }, idx) => (
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
        <Switch>
          {mainTargets.map(
            (target, i) =>
              target.node && (
                <Route path={target.target} key={i}>
                  {target.node}
                </Route>
              )
          )}
        </Switch>
      </Drawer>
    </Sheet>
  );
}

//component={Link} href="/"
