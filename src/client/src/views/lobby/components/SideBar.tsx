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
import { Link, Route, Switch } from "wouter";
import { mainTargets } from "../types";

export default function SideBar() {
  return (
    <Sheet className="SideBar">
      <Drawer
        open={true}
        className="SideBar"
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
            // backgroundColor: theme=>lighten(theme.resolveVar("palette-background-level1"), 0.7),
            backgroundColor: "background.level1",
            display: "flex",
            flexDirection: "column",
            width: "fit-content",
            paddingRight: 20,
            borderRight: "0.5px solid",
            zIndex: 1,
            boxShadow: "0px 1px 4px rgba(0, 0, 0, 1)",
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
                <Route path={target.route ?? target.target} key={i}>
                  {target.node}
                </Route>
              )
          )}
        </Switch>
      </Drawer>
    </Sheet>
  );
}
