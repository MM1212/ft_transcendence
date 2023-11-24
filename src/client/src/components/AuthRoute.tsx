import { useIsLoggedIn } from '@hooks/user';
import React from 'react';
import { Redirect, Route, RouteProps } from 'wouter';

export default function AuthRoute(
  props: RouteProps & {
    fallback?: React.ReactNode;
    redirect?: string;
  }
) {
  const firstMount = React.useRef(true);
  const loggedIn = useIsLoggedIn();

  const { fallback, redirect, ...rest } = props;

  React.useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
    }
  }, []);

  if (!firstMount.current) {
    if (loggedIn) {
      return <Route {...rest} />;
    }
    if (redirect) {
      return <Redirect to={redirect} />;
    }
  }
  if (fallback) {
    return <>{fallback}</>;
  }
  return null;
}
