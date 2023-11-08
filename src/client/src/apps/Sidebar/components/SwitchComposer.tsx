import { Route, Switch } from 'wouter';
import routes, { ISidebarRoute, ISidebarSingleRoute } from '../routes';
import React from 'react';

export default function SidebarSwitchComposer() {
  const possibleRoutes = React.useMemo(() => {
    const getPossibleRoutes = (
      parent: ISidebarRoute
    ): {
      path: string;
      Component: ISidebarSingleRoute['Component'];
    }[] => {
      if (!parent.children)
        return [
          {
            path: parent.routePath ?? parent.path,
            Component: parent.Component,
          },
        ];
      return parent.children.flatMap(getPossibleRoutes);
    };
    return routes.flatMap(getPossibleRoutes);
  }, []);
  return (
    <Switch>
      {possibleRoutes.map(({ path, Component }, i) => (
        <Route path={path} key={i}>
          {Component ? <Component /> : null}
        </Route>
      ))}
    </Switch>
  );
}
