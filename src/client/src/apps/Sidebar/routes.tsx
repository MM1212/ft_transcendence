import ChatMessagesLoadingView from '@apps/Chat/views/loading';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';
import AccountIcon from '@components/icons/AccountIcon';
import AccountSearchIcon from '@components/icons/AccountSearchIcon';
import ControllerIcon from '@components/icons/ControllerIcon';
import ForumIcon from '@components/icons/ForumIcon';
import HangerIcon from '@components/icons/HangerIcon';
import HistoryIcon from '@components/icons/HistoryIcon';
import HomeIcon from '@components/icons/HomeIcon';
import ImageFilterCenterFocusIcon from '@components/icons/ImageFilterCenterFocusIcon';
import LoginVariantIcon from '@components/icons/LoginVariantIcon';
import PlayIcon from '@components/icons/PlayIcon';
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
    label: 'Lobby (TEMP)',
    path: '/lobby',
    icon: <ImageFilterCenterFocusIcon />,
    Component: React.lazy(() => import('@views/lobby')),
  },
  {
    label: 'Social',
    icon: <AccountGroupIcon />,
    children: [
      {
        label: 'My Profile',
        path: '/profile',
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
    label: 'LoginPage',
    path: '/loginPage',
    icon: <LoginVariantIcon />,
    exact : false,
    Component: React.lazy(() => import('@apps/LoginPage/views'))
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
            // Component: React.lazy(() => import('@views/pong')),
          },
          {
            label: 'Match History',
            path: '/history',
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
