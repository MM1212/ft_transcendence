import { AuthModel, EndpointResponse } from '@typings/api';
import {
  FetchError,
  buildTunnelEndpoint,
  useTunnelEndpoint,
} from '@/hooks/tunnel';
import React from 'react';
import {} from 'wouter';
import useLocation, { navigate } from 'wouter/use-location';
import tunnel from '@lib/tunnel';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
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
    document.location.href = buildTunnelEndpoint(
      AuthModel.Endpoints.Targets.Login
    );
  };
  const logout = async (): Promise<void> => {
    await tunnel.rawGet(AuthModel.Endpoints.Targets.Logout);
    await clearAllSwrCache();
    navigate('/login');
  };

  return { login, logout };
};

export const useSession = (
  options: SWRConfiguration<EndpointResponse<AuthModel.Endpoints.Session>> = {}
): Session => {
  const { data, isLoading, isValidating, error } =
    useTunnelEndpoint<AuthModel.Endpoints.Session>(
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
  const setSession = useSetRecoilState(sessionAtom);
  const { user, loading } = useSession();
  React.useEffect(() => {
    if (loading) return;
    setSession((prev) => {
      if (isEqual(prev, user)) return prev;
      return user;
    });
  }, [setSession, user, loading]);

  return null;
};

export const useCurrentUser = (): IUser | null => useRecoilValue(sessionAtom);
export const useUser = (id: number): IUser | null =>
  useRecoilValue(usersAtom(id));
export const useIsLoggedIn = (): boolean => useRecoilValue(isLoggedInSelector);

export const useUsersService = () => {
  const onUserUpdate = useRecoilCallback(
    (ctx) => (ev: UsersModel.Sse.UserUpdatedEvent) => {
      const {
        data: { id, avatar, nickname, studentId, status },
      } = ev;
      const userUpdate: Partial<UsersModel.Models.IUserInfo> = {
        avatar,
        nickname,
        studentId,
        status,
      };
      for (const key in userUpdate) {
        if (userUpdate[key as keyof typeof userUpdate] === undefined)
          delete userUpdate[key as keyof typeof userUpdate];
      }
      const { state } = ctx.snapshot.getLoadable(usersAtom(id));
      const { isActive } = ctx.snapshot.getInfo_UNSTABLE(usersAtom(id));
      if (state === 'loading' || !isActive) {
        console.warn('User not found in cache, skipping update');
        return;
      }
      ctx.set(usersAtom(id), (prev) =>
        !prev
          ? prev
          : {
              ...prev,
              ...userUpdate,
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
