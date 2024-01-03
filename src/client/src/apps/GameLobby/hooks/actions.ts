import { useChatPasswordInputModalActions } from '@apps/Chat/modals/ChatPasswordInputModal/hooks/useChatPasswordInputModal';
import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';
import { useRecoilCallback } from 'recoil';
import pongGamesState from '../state';
import notifications from '@lib/notifications/hooks';
import { GroupEnumValues } from '@typings/utils';

export const useLobbyActions = () => {
  const { prompt } = useChatPasswordInputModalActions();

  const joinGame = useRecoilCallback(
    (ctx) =>
      async (
        lobbyId: number,
        authorization: GroupEnumValues<PongModel.Models.LobbyAccess>,
        name: string,
        nonce?: number
      ): Promise<boolean> => {
        try {
          let pass: string | null = null;
          if (authorization === PongModel.Models.LobbyAccess.Protected) {
            console.log('prompting for password');
            pass = await prompt({
              chatName: name,
            });
            if (!pass) return false;
          }
          const lobbyJoined = await tunnel.post(
            PongModel.Endpoints.Targets.JoinLobby,
            {
              lobbyId,
              password: pass,
              nonce,
            }
          );
          if (lobbyJoined === null) return false;
          ctx.set(pongGamesState.gameLobby, lobbyJoined);
          return true;
        } catch (error) {
          notifications.error('Failed to join lobby', (error as Error).message);
          return false;
        }
      },
    [prompt]
  );

  return {
    joinGame,
  };
};
