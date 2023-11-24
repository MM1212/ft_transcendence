import {
  atom,
  atomFamily,
  selector,
  useRecoilCallback,
  useRecoilValue,
} from 'recoil';

const modalsAtom = atomFamily<boolean, string>({
  key: 'modals',
  default: false,
});
const modalsDataAtom = atomFamily<any, string>({
  key: 'modalsData',
  default: {
    dismissable: true,
  },
});

const modalsRegistryAtom = atom<string[]>({
  key: 'modalsRegistry',
  default: [],
});

const isAnyModalOpenedSelector = selector({
  key: 'isAnyModalOpened',
  get: ({ get }) => {
    const modalsRegistry = get(modalsRegistryAtom);
    return modalsRegistry.length > 0;
  },
});

export const useModalActions = <T>(id: string) => {
  const open = useRecoilCallback(
    (ctx) =>
      (
        data?: Omit<ModalState<T>, 'dismissable'> & {
          dismissable?: boolean;
        }
      ) => {
        if (data) {
          ctx.set(
            modalsDataAtom(id),
            (prev: ModalState<T>) =>
              ({
                dismissable: prev.dismissable,
                ...data,
              }) as ModalState<T>
          );
        }
        ctx.set(modalsAtom(id), true);
        ctx.set(modalsRegistryAtom, (ids) => [...ids, id]);
      },
    [id]
  );
  const close = useRecoilCallback(
    (ctx) =>
      async (
        _event?: {},
        reason?: 'backdropClick' | 'escapeKeyDown' | 'closeClick'
      ) => {
        const data = await ctx.snapshot.getPromise(modalsDataAtom(id));
        if (data?.dismissable === false && !!reason) return;
        ctx.set(modalsAtom(id), false);
        ctx.set(modalsRegistryAtom, (ids) => ids.filter((i) => i !== id));
      },
    [id]
  );
  const toggle = useRecoilCallback(
    (ctx) => async (data?: T) => {
      const isOpened = await ctx.snapshot.getPromise(modalsAtom(id));
      ctx.set(modalsAtom(id), !isOpened);
      if (data) ctx.set(modalsDataAtom(id), data);
      ctx.set(modalsRegistryAtom, (ids) =>
        isOpened ? ids.filter((i) => i !== id) : [...ids, id]
      );
    },
    [id]
  );
  return { open, close, toggle };
};

export type ModalState<T> = T & {
  dismissable: boolean;
};

export const useModal = <T>(id: string) => {
  const isOpened = useRecoilValue(modalsAtom(id));
  const data = useRecoilValue<ModalState<T>>(modalsDataAtom(id));
  const setData = useRecoilCallback(
    (ctx) => (data: T) =>
      ctx.set(modalsDataAtom(id), (prev) => ({
        dismissable: prev.dismissable,
        ...data,
      })),
    [id]
  );
  const { open, close, toggle } = useModalActions<T>(id);
  return { isOpened, data, setData, open, close, toggle };
};

export const useIsAnyModalOpened = () =>
  useRecoilValue(isAnyModalOpenedSelector);
