import { Sheet } from "@mui/joy";
import FriendsHeader from "./FriendsHeader";
import { Route, Switch } from "wouter";
import { FriendsRoutes } from "./Friends/FriendsRoutes";


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
      </Sheet>
    </>
  );
}
