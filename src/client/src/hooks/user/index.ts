import { AuthModel, EndpointResponse } from '@typings/api';
import {
  FetchError,
  buildTunnelEndpoint,
  useRawTunnelEndpoint,
} from '@/hooks/tunnel';
import React from 'react';
import {} from 'wouter';
import useLocation, { navigate } from 'wouter/use-location';
import tunnel from '@lib/tunnel';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { clearAllSwrCache } from '../swrUtils';
import UsersModel from '@typings/models/users';
import { isLoggedInSelector, sessionAtom, usersAtom } from './state';
import { useSseEvent } from '@hooks/sse';
import isEqual from 'lodash.isequal';
import { useFriendsService } from '@apps/Friends/state/service';
import { SWRConfiguration } from 'swr';
export * from './state';
type LoadingSession = { readonly loading: boolean };
type IUser = UsersModel.Models.IUserInfo;

interface LoggedInSession {
  readonly loggedIn: true;
  readonly user: AuthModel.DTO.Session;
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
    document.location.href = buildTunnelEndpoint(
      AuthModel.Endpoints.Targets.Login
    );
  };
  const logout = async (): Promise<void> => {
    await tunnel.rawGet(AuthModel.Endpoints.Targets.Logout);
    await clearAllSwrCache();
    navigate('/login');
    window.location.reload(); // invalidate all recoil cache
  };

  return { login, logout };
};

export const useSession = (
  options: SWRConfiguration<EndpointResponse<AuthModel.Endpoints.Session>> = {}
): Session => {
  const { data, isLoading, isValidating, error } =
    useRawTunnelEndpoint<AuthModel.Endpoints.Session>(
      AuthModel.Endpoints.Targets.Session,
      undefined,
      options
    );
  const actions = useSessionActions();
  if (isLoading || isValidating)
    return { ...actions, loading: true, loggedIn: false, user: null };
  if (error || (!data && !isLoading) || (data && data.status === 'error')) {
    if (!(error instanceof FetchError) || error.response.status !== 401)
      console.error(error);
    else if (data && data.status === 'error') console.error(data.errorMsg);
    return { ...actions, loggedIn: false, loading: false, user: null };
  }
  return {
    ...actions,
    loggedIn: true,
    loading: false,
    user: data!.data,
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
  const { user, loading } = useSession();

  const updateSession = useRecoilCallback(
    (ctx) => (user: AuthModel.DTO.Session | null) => {
      ctx.set(sessionAtom, (prev) => {
        if (!user) return null;
        if (isEqual(prev, user)) return prev;
        return user;
      });
      if (!user) return;
      const { state } = ctx.snapshot.getLoadable(usersAtom(user.id));
      const { isActive } = ctx.snapshot.getInfo_UNSTABLE(usersAtom(user.id));
      if (state === 'loading' || !isActive) {
        return;
      }
      ctx.set(usersAtom(user.id), (prev) => {
        if (!user) return null;
        if (isEqual(prev, user)) return prev;
        return user;
      });
    },
    []
  );
  React.useEffect(() => {
    if (loading) return;
    updateSession(user);
  }, [updateSession, user, loading]);

  return null;
};

export const useCurrentUser = (): AuthModel.DTO.Session | null =>
  useRecoilValue(sessionAtom);
export const useUser = (id: number): IUser | null =>
  useRecoilValue(usersAtom(id));
export const useIsLoggedIn = (): boolean => useRecoilValue(isLoggedInSelector);

export const useUsersService = () => {
  const onUserUpdate = useRecoilCallback(
    (ctx) => async (ev: UsersModel.Sse.UserUpdatedEvent) => {
      const session = await ctx.snapshot.getPromise(sessionAtom);
      if (!session) return;
      const { data } = ev;
      const {id} = data;
      for (const key in data) {
        if (data[key as keyof typeof data] === undefined)
          delete data[key as keyof typeof data];
      }
      if (id === session.id) {
        ctx.set(sessionAtom, (prev) => ({
          ...prev!,
          ...data,
        }));
        return;
      }
      const { isActive } = ctx.snapshot.getInfo_UNSTABLE(usersAtom(id));
      if (!isActive) {
        return;
      }
      ctx.set(usersAtom(id), (prev) =>
        !prev
          ? prev
          : {
              ...prev,
              ...data,
            }
      );
    },
    []
  );

  useSseEvent<UsersModel.Sse.UserUpdatedEvent>(
    UsersModel.Sse.Events.UserUpdated,
    onUserUpdate
  );

  useFriendsService();
};
