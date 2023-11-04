import { AuthModel } from '@typings/api';
import { IUser } from '@typings/user';
import { FetchError, buildTunnelEndpoint, useTunnelEndpoint } from './tunnel';
import React from 'react';
import {} from 'wouter';
import useLocation from 'wouter/use-location';
import tunnel from '@lib/tunnel';
import { atom, useSetRecoilState } from 'recoil';
import { clearAllSwrCache } from './swrUtils';

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

export const sessionAtom = atom<IUser | null>({
  key: 'session',
  default: null,
});

export const useSessionActions = (): SessionActions => {
  const login = async (): Promise<void> => {
    document.location.href = buildTunnelEndpoint(
      AuthModel.Endpoints.Targets.Login
    );
  };
  const logout = async (): Promise<void> => {
    const res = await tunnel.get<AuthModel.Endpoints.Logout>(
      AuthModel.Endpoints.Targets.Logout
    );
    if (!res) throw new Error('Failed to logout');
    await clearAllSwrCache();
  };

  return { login, logout };
};

export const useSession = (): Session => {
  const { data, isLoading, isValidating, error } =
    useTunnelEndpoint<AuthModel.Endpoints.Session>(
      AuthModel.Endpoints.Targets.Session
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

export const useSessionRecoilService = () => {
  const setSession = useSetRecoilState(sessionAtom);
  const { user } = useSession();
  React.useEffect(() => {
    setSession(user ?? null);
  }, [setSession, user]);

  return null;
};