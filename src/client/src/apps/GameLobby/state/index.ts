import { atom } from 'recoil';


export const roomPlayersTester = atom<number[]>({
    key: "roomPlayers",
    default: [],
})