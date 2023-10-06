import { Endpoints } from '@typings/api';
import { IUser } from '@typings/user';
import { FetchError, buildTunnelEndpoint, useTunnelEndpoint } from './tunnel';
import React from 'react';
import {} from 'wouter';
import useLocation from 'wouter/use-location';
import tunnel from '@lib/tunnel';
import { mutate } from 'swr';

type LoadingSession = { readonly loading: boolean };

interface LoggedInSession {
  readonly loggedIn: true;
  readonly user: IUser;
}

interface SessionActions {
  login(): Promise<void>;
  logout(): Promise<void>;
}

type Session = LoadingSession &
  SessionActions &
  (LoggedInSession | { readonly loggedIn: false; readonly user: null });

export const useSessionActions = (): SessionActions => {
  const login = async (): Promise<void> => {
    document.location.href = buildTunnelEndpoint(Endpoints.AuthLogin);
  };
  const logout = async (): Promise<void> => {
    const res = await tunnel.get<undefined>(Endpoints.AuthLogout);
    if (!res) throw new Error('Failed to logout');
    mutate(buildTunnelEndpoint(Endpoints.UsersMe), undefined, {
      revalidate: true,
    });
  };

  return { login, logout };
};

export const useSession = (): Session => {
  const { data, isLoading, isValidating, error } = useTunnelEndpoint<IUser>(
    Endpoints.UsersMe, {revalidateOnFocus: false}
  );
  const actions = useSessionActions();

  if (isLoading || isValidating)
    return { ...actions, loading: true, loggedIn: false, user: null };
  if (error || !data || data.status === 'error') {
    if (!(error instanceof FetchError) || error.response.status !== 401)
      console.error(error);
    else if (data && data.status === 'error') console.error(data.errorMsg);
    return { ...actions, loggedIn: false, loading: false, user: null };
  }
  return {
    ...actions,
    loggedIn: true,
    loading: false,
    user: data.data,
  };
};

export const useLoggedInSession = (
  fallback: string = '/'
): LoggedInSession & LoadingSession => {
  const session = useSession();
  const [, navigate] = useLocation();
  React.useEffect(() => {
    if (!session.loading && !session.loggedIn)
      navigate(fallback, { replace: true });
  }, [session, fallback, navigate]);

  return session as LoggedInSession & LoadingSession;
};
