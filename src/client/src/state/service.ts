import useMessagesService from '@apps/Chat/hooks/service';
import useSseService from '@hooks/sse/Provider';
import { useSessionRecoilService, useUsersService } from '@hooks/user';
import useFirstLoginPrompter from '@hooks/user/useFirstLoginPrompter';

const useAppService = () => {
  useSseService();
  useSessionRecoilService();
  useMessagesService();
  useUsersService();
  useFirstLoginPrompter();
};

export default useAppService;
