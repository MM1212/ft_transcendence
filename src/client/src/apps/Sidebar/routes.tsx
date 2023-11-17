import AccountGroupIcon from "@components/icons/AccountGroupIcon";
import AccountIcon from "@components/icons/AccountIcon";
import ControllerIcon from "@components/icons/ControllerIcon";
import ForumIcon from "@components/icons/ForumIcon";
import HangerIcon from "@components/icons/HangerIcon";
import HistoryIcon from "@components/icons/HistoryIcon";
import HomeIcon from "@components/icons/HomeIcon";
import ImageFilterCenterFocusIcon from "@components/icons/ImageFilterCenterFocusIcon";
import PlayIcon from "@components/icons/PlayIcon";
import TableTennisIcon from "@components/icons/TableTennisIcon";
import TrophyIcon from "@components/icons/TrophyIcon";
import React from "react";

export interface ISidebarSingleRoute {
  path: string;
  routePath?: string;
  icon: React.ReactNode;
  label: string;
  Component?: React.ComponentType;
  exact?: boolean;
  children?: never;
  endDecoration?: React.ReactNode;
}

export interface ISidebarNestedRoute {
  path?: string;
  icon: React.ReactNode;
  label: string;
  children: ISidebarRoute[];
}

export type ISidebarRoute = ISidebarSingleRoute | ISidebarNestedRoute;

const routes: ISidebarRoute[] = [
  {
    label: "Home",
    path: "/",
    icon: <HomeIcon />,
    // Component: React.lazy(() => import('@views/home')),
  },
  {
    label: "My Profile",
    path: "/profile",
    icon: <AccountIcon />,
    Component: React.lazy(() => import("@apps/Profile/views")),
    exact: false,
  },
  {
    label: "Lobby (TEMP)",
    path: "/lobby",
    icon: <ImageFilterCenterFocusIcon />,
    Component: React.lazy(() => import("@views/lobby")),
  },
  {
    label: "Messages",
    path: "/messages",
    icon: <ForumIcon />,
    exact: false,
    Component: React.lazy(() => import("@apps/Chat/views")),
  },
  {
    label: "Friends",
    path: "/friends",
    routePath: "/friends/:rest*",
    icon: <AccountGroupIcon />,
    exact: false,
    Component: React.lazy(() => import("@apps/Friends/views")),
  },
  {
    label: "Achievements",
    path: "/achievements",
    icon: <TrophyIcon />,
    exact: false,
    Component: React.lazy(() => import("@apps/Achievements/views")),
  },
  {
    label: "Customization",
    path: "/customization",
    icon: <HangerIcon />,
    exact: false,
    Component: React.lazy(() => import("@apps/Customization/views")),
  },
  {
    label: "tempGameLobby",
    path: "/game",
    icon: <ControllerIcon />,
    exact: false,
    Component: React.lazy(() => import("@apps/GameLobby/views")),
  },
  {
    label: "Games",
    icon: <ControllerIcon />,
    children: [
      {
        label: "Pong",
        path: "/pong",
        icon: <TableTennisIcon />,
        children: [
          {
            label: "Play",
            path: "/play",
            icon: <PlayIcon />,
            exact: false,
            Component: React.lazy(() => import("@apps/GameLobby/views")),
          },
          {
            label: "Match History",
            path: "/history",
            icon: <HistoryIcon />,
            exact: false,
            // Component: React.lazy(() => import('@views/pong')),
          },
        ],
      },
    ],
  },
];

export default routes;
