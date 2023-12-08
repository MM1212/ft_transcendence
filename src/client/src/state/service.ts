import useMessagesService from '@apps/Chat/hooks/service';
import useSseService from '@hooks/sse/Provider';
import { useSessionRecoilService, useUsersService } from '@hooks/user';
import useFirstLoginPrompter from '@hooks/user/useFirstLoginPrompter';
import { useLocationService } from './location';
import { useNotificationsService } from '@lib/notifications/service';

const useAppService = () => {
  useLocationService();
  useSseService();
  useSessionRecoilService();
  useMessagesService();
  useUsersService();
  useFirstLoginPrompter();
  useNotificationsService();
};

export default useAppService;
