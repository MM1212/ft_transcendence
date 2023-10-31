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
  Slider,
} from "@mui/joy";
import { useKeybindsToggle } from "@hooks/keybinds";
import Link from "@components/Link";
import { Route, Router, Switch, useLocation, useRoute, useRouter } from "wouter";
import { mainTargets, simpleTargets } from "../types";
import { navigate } from "wouter/use-location";
import { useRecoilState } from "recoil";
import { sessionAtom, useSession } from "@hooks/user";
import FriendsAll from "./Friends/FriendsAll";
import FriendsPanel from "./FriendsPanel";
import MessagesPanel from "./MessagesPanel";

const ActiveLink = (props: any) => {
  const [isActive] = useRoute(props.href);
  return (
    <Link {...props}>
      <a className={isActive ? "active" : ""} href={props.href}>
        {props.children}
      </a>
    </Link>
  );
};

const NestedRoutes = (props : any) => {
  const router = useRouter();
  const [location] = useLocation();

  if (!location.startsWith(props.base)) return null;

  // we need key to make sure the router will remount if the base changes
  return (
    <Router base={props.base} key={props.base} parent={router}>
      {props.children}
    </Router>
  );
};

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
            <nav>
              {/* {mainTargets.map(({ label, target }) => (
                <ActiveLink href={target}>{label}</ActiveLink>
              ))}
              <ActiveLink href="/help"></ActiveLink> */}
              <ActiveLink href="/messages">Messages</ActiveLink>
              <ActiveLink href="/friends">Friends</ActiveLink>
            </nav>
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
