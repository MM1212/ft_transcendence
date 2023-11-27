import ChatMessagesLoadingView from '@apps/Chat/views/loading';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';
import AccountIcon from '@components/icons/AccountIcon';
import AccountSearchIcon from '@components/icons/AccountSearchIcon';
import ControllerIcon from '@components/icons/ControllerIcon';
import DevToIcon from '@components/icons/DevToIcon';
import ForumIcon from '@components/icons/ForumIcon';
import HangerIcon from '@components/icons/HangerIcon';
import HistoryIcon from '@components/icons/HistoryIcon';
import HomeIcon from '@components/icons/HomeIcon';
import PlayIcon from '@components/icons/PlayIcon';
import PodiumIcon from '@components/icons/PodiumIcon';
import TableTennisIcon from '@components/icons/TableTennisIcon';
import TrophyIcon from '@components/icons/TrophyIcon';
import React from 'react';

export interface ISidebarSingleRoute {
  path: string;
  routePath?: string;
  icon: React.ReactNode;
  label: string;
  Component?: React.ComponentType;
  FallBackComponent?: React.ComponentType;
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
    label: 'Home',
    path: '/',
    icon: <HomeIcon />,
    // Component: React.lazy(() => import('@views/home')),
  },
  {
    label: 'Social',
    icon: <AccountGroupIcon />,
    children: [
      {
        label: 'My Profile',
        path: '/profile/me',
        routePath: '/profile/:rest*',
        icon: <AccountIcon />,
        Component: React.lazy(() => import('@apps/Profile/views')),
        exact: false,
      },
      {
        label: 'Friends',
        path: '/friends',
        routePath: '/friends/:rest*',
        icon: <AccountGroupIcon />,
        exact: false,
        Component: React.lazy(() => import('@apps/Friends/views')),
      },
      {
        label: 'Search',
        path: '/search',
        icon: <AccountSearchIcon />,
        exact: false,
        // Component: React.lazy(() => import('@apps/Search/views')),
      },
    ],
  },
  {
    label: 'Messages',
    path: '/messages/',
    routePath: '/messages/:chatId*',
    icon: <ForumIcon />,
    exact: false,
    Component: React.lazy(() => import('@apps/Chat/views')),
    FallBackComponent: ChatMessagesLoadingView,
  },
  {
    label: 'Achievements',
    path: '/achievements',
    icon: <TrophyIcon />,
    exact: false,
    Component: React.lazy(() => import('@apps/Achievements/views')),
  },
  {
    label: 'Customization',
    path: '/customization',
    icon: <HangerIcon />,
    exact: false,
    Component: React.lazy(() => import('@apps/Customization/views')),
  },
  {
    label: 'Games',
    icon: <ControllerIcon />,
    children: [
      {
        label: 'Pong',
        path: '/pong',
        icon: <TableTennisIcon />,
        children: [
          {
            label: 'Play',
            path: '/',
            icon: <PlayIcon />,
            exact: false,
            Component: React.lazy(() => import('@apps/GameLobby/views')),
          },
          {
            label: 'Match History',
            path: '/history',
            icon: <HistoryIcon />,
            exact: false,
            // Component: React.lazy(() => import('@views/pong')),
          },
          {
            label: 'Leaderboard',
            path: '/leaderboard',
            icon: <PodiumIcon />,
            exact: false,
            Component: React.lazy(() => import('@apps/Leaderboard/views'))
          },
        ],
      },
    ],
  },
];

if (import.meta.env.DEV) {
  routes.push({
    label: 'Dev',
    icon: <DevToIcon />,
    children: [
      {
        label: 'Clothing Showcase',
        path: '/dev/clothing-showcase',
        icon: <HangerIcon />,
        exact: false,
        Component: React.lazy(() => import('@views/ClothingShowcase')),
      },
    ],
  });
}

export default routes;
