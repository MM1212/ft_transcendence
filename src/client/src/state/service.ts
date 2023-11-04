import useSseService from "@hooks/sse/Provider";
import { useSessionRecoilService } from "@hooks/user";

const useAppService = () => {
  useSseService();
  useSessionRecoilService();
};

export default useAppService;