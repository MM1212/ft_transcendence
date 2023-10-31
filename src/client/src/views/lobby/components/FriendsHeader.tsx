import {
  ListItem,
  ListItemButton,
  ListItemContent,
  Typography,
} from "@mui/joy";
import { Stack } from "@mui/joy";
import FriendsOnline from "./Friends/FriendsOnline";
import FriendsAll from "./Friends/FriendsAll";
import FriendsPending from "./Friends/FriendsPending";
import FriendsBlocked from "./Friends/FriendsBlocked";
import AddFriend from "./Friends/FriendsAddFriend";
import { Link, Route, Switch } from "wouter";
import FriendsPanel from "./FriendsPanel";
import { subTargets } from "../types";

export default function FriendsHeader() {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "neutral.700",
        }}
        py={{ xs: 2, md: 2 }}
        px={{ xs: 3, md: 2 }}
      >
        <Stack direction="row" spacing={{ xs: 5, md: 4 }} alignItems="left">
          <Typography
            sx={{
              paddingTop: "0.3rem",
              borderRight: "0.1px solid #403C3C",
              paddingRight: "1.5rem",
            }}
          >
            Friends
          </Typography>
          <FriendsOnline />
          <FriendsAll />
          <FriendsPending />
          <FriendsBlocked />
          <AddFriend />
        </Stack>
      </Stack>
      {/* <Switch>
          {subTargets.map(
            (target, i) =>
              target.node && (
                <Route path={target.target} key={i}>
                  {target.node}
                </Route>
              )
          )}
        </Switch> */}
    </>
  );
}
