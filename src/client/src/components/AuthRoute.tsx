import { useLoggedInSession } from '@hooks/user';
import React from 'react';
import { Route, RouteProps } from 'wouter';

export default function AuthRoute(
  props: RouteProps & {
    redirect?: string;
  }
) {
  const { redirect, ...rest } = props;
  useLoggedInSession(redirect);
  return <Route {...rest} />;
}
