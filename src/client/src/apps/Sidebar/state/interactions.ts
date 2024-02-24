import { Interaction, type InteractionData } from '@apps/Lobby/src/Interaction';
import type { ClientLobby } from '@apps/Lobby/src/Lobby';

class SidebarInteraction extends Interaction {
  constructor(lobby: ClientLobby, data: InteractionData) {
    super(lobby, data);
  }
  static readonly ID = 'sidebar';
  static create(lobby: ClientLobby) {
    return new SidebarInteraction(lobby, {
      id: SidebarInteraction.ID,
      keyDisplay: 'ESC',
      key: 'KeyEscape',
      label: 'Open Menu',
      showing: false,
    });
  }
  async onMount(): Promise<void> {}
  async destructor(): Promise<void> {}
  async update(): Promise<boolean | void> {
    
    return true;
  }
  onClick(): void | Promise<void> {}
}

export { SidebarInteraction };
