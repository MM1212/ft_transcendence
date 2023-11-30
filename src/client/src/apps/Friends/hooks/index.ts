import { useRecoilValue } from 'recoil';
import friendsState from '../state';

export const useFriends = () => useRecoilValue(friendsState.friends);
export const useBlocked = () => useRecoilValue(friendsState.blocked);