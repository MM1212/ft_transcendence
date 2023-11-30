import { ChatSelectedData } from '../hooks/useChatSelectModal';

export interface ChatSelectEntry extends ChatSelectedData {
  selected: boolean;
  multiple: boolean;
}

export interface ChatSelectEntryProps extends ChatSelectEntry {
  toggle: () => void;
}