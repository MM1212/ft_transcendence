import { atomFamily } from 'recoil';
import { Socket, io } from 'socket.io-client';

export const socketStorageAtom = atomFamily<Socket, string>({
  key: 'socketStorageAtom',
  default: (url) => {
    const socket = io(url, {
      autoConnect: false,
      withCredentials: true,
    });
    return socket;
  },
  dangerouslyAllowMutability: true,
});
