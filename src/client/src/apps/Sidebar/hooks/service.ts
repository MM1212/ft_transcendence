import { useRegisterInteraction } from '@apps/Lobby/state';
import { SidebarInteraction } from '../state/interactions';

export const useSidebarService = () => {
  useRegisterInteraction(SidebarInteraction);
};
