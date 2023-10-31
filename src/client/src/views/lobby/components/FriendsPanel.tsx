import { Sheet } from "@mui/joy";
import FriendsHeader from "./FriendsHeader";
import { Route, Switch } from "wouter";
import { FriendsRoutes } from "./Friends/FriendsRoutes";
import { subTargets } from "../types";

export default function FriendsPanel() {
  return (
    <>
      <Sheet
        sx={{
          borderRight: "1px solid",
          borderColor: "divider",
          height: "calc(100dvh - var(--Header-height))",
          overflowY: "auto",
          backgroundColor: "background.level2",
          width: "60%",
        }}
      >
        <FriendsHeader />
        {/* <TestPanelFriends /> */}
      </Sheet>
      <Switch>
        <Route path="/online">
          <article>
            <h1>How it all started?</h1>
          </article>
        </Route>
      </Switch>
    </>
  );
}
