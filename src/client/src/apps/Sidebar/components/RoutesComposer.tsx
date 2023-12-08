import ChevronDownIcon from '@components/icons/ChevronDownIcon';
import {
  Box,
  listItemButtonClasses,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Typography,
} from '@mui/joy';
import Toggler from './Toggler';
import routes, {
  ISidebarNestedRoute,
  ISidebarRoute,
  ISidebarSingleRoute,
  endRoutes,
} from '../routes';
import Link from '@components/Link';
import { Router, useRoute } from 'wouter';
import React from 'react';

export function SidebarSingleRoute({
  icon,
  label,
  path,
  routePath,
  endDecoration,
}: ISidebarSingleRoute): JSX.Element {
  const [matches] = useRoute(routePath ?? path);

  return React.useMemo(
    () => (
      <ListItem>
        <ListItemButton component={Link} href={path} selected={matches}>
          {icon}
          <ListItemContent>
            <Typography level="title-sm">{label}</Typography>
          </ListItemContent>
          {endDecoration}
        </ListItemButton>
      </ListItem>
    ),
    [endDecoration, icon, label, matches, path]
  );
}

export function SidebarNestedRoute({
  icon,
  label,
  children,
  path,
}: ISidebarNestedRoute): JSX.Element {
  return (
    <ListItem nested>
      <Toggler
        renderToggle={({ open, setOpen }) => (
          <ListItemButton onClick={() => setOpen(!open)}>
            {icon}
            <ListItemContent>
              <Typography level="title-sm">{label}</Typography>
            </ListItemContent>
            <ChevronDownIcon
              sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
            />
          </ListItemButton>
        )}
      >
        <List sx={{ gap: 0.5 }}>
          {children.map((route, i) => (
            <SidebarRoute
              key={i}
              {...route}
              path={
                (path
                  ? `${path}${route.path}`
                  : route.path) as ISidebarSingleRoute['path']
              }
            />
          ))}
        </List>
      </Toggler>
    </ListItem>
  );
}

function SidebarRoute(route: ISidebarRoute): JSX.Element {
  if (route.children)
    return <SidebarNestedRoute {...(route as ISidebarNestedRoute)} />;
  const { exact = true } = route as ISidebarSingleRoute;
  if (exact)
    return (
      <Router ssrPath={window.location.pathname}>
        <SidebarSingleRoute {...(route as ISidebarSingleRoute)} />
      </Router>
    );
  return <SidebarSingleRoute {...(route as ISidebarSingleRoute)} />;
}

export default function SidebarRoutes(): JSX.Element {
  return (
    <Box
      sx={{
        minHeight: 0,
        overflow: 'hidden auto',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        [`& .${listItemButtonClasses.root}`]: {
          gap: 1.5,
        },
      }}
    >
      <List
        size="sm"
        sx={{
          gap: 1,
          '--List-nestedInsetStart': (theme) => theme.spacing(2),
          '--ListItem-radius': (theme) => theme.vars.radius.sm,
        }}
      >
        {routes.map((route, i) => (
          <SidebarRoute key={i} {...route} />
        ))}
        <Box sx={{ flexGrow: 1 }} />
        {endRoutes.map((route, i) => (
          <SidebarRoute key={i} {...route} />
        ))}
      </List>
    </Box>
  );
}
