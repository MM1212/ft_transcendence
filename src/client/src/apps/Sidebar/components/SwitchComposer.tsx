import { Route, Switch } from 'wouter';
import routes, {
  ISidebarNestedRoute,
  ISidebarRoute,
  ISidebarSingleRoute,
} from '../routes';
import React from 'react';
import SidebarRouteFallbackSkeleton from './Skeleton';

export default function SidebarSwitchComposer() {
  const possibleRoutes = React.useMemo(() => {
    const getPossibleRoutes =
      (parent: ISidebarNestedRoute | null) =>
      (
        elem: ISidebarRoute
      ): {
        path: string;
        Component: ISidebarSingleRoute['Component'];
        FallBackComponent?: ISidebarSingleRoute['FallBackComponent'];
      }[] => {
        if (!elem.children)
          return [
            {
              path: [parent?.path, elem.routePath ?? elem.path]
                .filter(Boolean)
                .join('/')
                .replace(/\/\//g, '/'),
              Component: elem.Component,
              FallBackComponent: elem.FallBackComponent,
            },
          ];
        return elem.children.flatMap(getPossibleRoutes(elem));
      };
    return routes.flatMap(getPossibleRoutes(null));
  }, []);

  return (
    <Switch>
      {possibleRoutes.map(
        (
          { path, Component, FallBackComponent = SidebarRouteFallbackSkeleton },
          i
        ) => (
          <Route path={path} key={i}>
            <React.Suspense fallback={<FallBackComponent />}>
              {Component ? <Component /> : <></>}
            </React.Suspense>
          </Route>
        )
      )}
    </Switch>
  );
}
