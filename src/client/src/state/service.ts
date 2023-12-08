import useMessagesService from '@apps/Chat/hooks/service';
import useSseService from '@hooks/sse/Provider';
import { useSessionRecoilService, useUsersService } from '@hooks/user';
import useFirstLoginPrompter from '@hooks/user/useFirstLoginPrompter';
import { useLocationService } from './location';
import { useNotificationsService } from '@lib/notifications/service';
import useLobbyService from '@apps/GameLobby/hooks/service';

const useAppService = () => {
  useLocationService();
  useSseService();
  useSessionRecoilService();
  useMessagesService();
  useLobbyService();
  useUsersService();
  useFirstLoginPrompter();
  useNotificationsService();
};

export default useAppService;
