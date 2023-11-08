import useMessagesService from '@apps/Chat/hooks/service';
import useSseService from '@hooks/sse/Provider';
import { useSessionRecoilService, useUsersService } from '@hooks/user';

const useAppService = () => {
  useSseService();
  useSessionRecoilService();
  useMessagesService();
  useUsersService();
};

export default useAppService;
