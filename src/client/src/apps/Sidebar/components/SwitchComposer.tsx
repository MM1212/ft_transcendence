import { Route, Switch } from 'wouter';
import routes, {
  ISidebarNestedRoute,
  ISidebarRoute,
  ISidebarSingleRoute,
} from '../routes';
import React from 'react';

export default function SidebarSwitchComposer() {
  const possibleRoutes = React.useMemo(() => {
    const getPossibleRoutes =
      (parent: ISidebarNestedRoute | null) =>
      (
        elem: ISidebarRoute
      ): {
        path: string;
        Component: ISidebarSingleRoute['Component'];
      }[] => {
        if (!elem.children)
          return [
            {
              path: [parent?.path, elem.routePath ?? elem.path]
                .filter(Boolean)
                .join('/')
                .replace(/\/\//g, '/'),
              Component: elem.Component,
            },
          ];
        return elem.children.flatMap(getPossibleRoutes(elem));
      };
    return routes.flatMap(getPossibleRoutes(null));
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
