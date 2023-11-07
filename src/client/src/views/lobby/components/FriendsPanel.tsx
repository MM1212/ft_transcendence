import { Divider, Sheet } from "@mui/joy";
import FriendsHeader from "./FriendsHeader";
import FriendsGetter from "./Friends/FriendsGetter";
import { Redirect, Route, Router, Switch, useRouter } from "wouter";
import PendingFriendsGetter from "./Friends/PendingFriendsGetter";

export default function FriendsPanel() {
  const router = useRouter();
  return (
    <Router base="/friends" parent={router}>
      <Sheet
        sx={{
          borderRight: "1px solid",
          borderColor: "divider",
          height: "calc(100dvh - var(--Header-height))",
          overflowY: "auto",
          backgroundColor: "background.level1",
          width: "60%",
        }}
      >
        <FriendsHeader />
        <Divider />
        <Switch>
          <Route path="/">
            <FriendsGetter type="online" />
          </Route>
          <Route path="/online">
            <Redirect to="/" />
          </Route>
          <Route path="/all">
            <FriendsGetter type="all" />
          </Route>
          <Route path="/pending">
            <PendingFriendsGetter />
          </Route>
        </Switch>
      </Sheet>
    </Router>
  );
}
