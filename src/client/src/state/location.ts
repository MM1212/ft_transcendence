import React from 'react';
import { atom, useRecoilTransaction_UNSTABLE, useRecoilValue } from 'recoil';
import useLocation from 'wouter/use-location';

export const locationAtom = atom<string>({
  key: 'location',
  default: '/',
});

export const useLocationValue = () => useRecoilValue(locationAtom);

export const useLocationService = () => {
  const [location] = useLocation();
  const setLocation = useRecoilTransaction_UNSTABLE(
    (ctx) => (location: string) => {
      ctx.set(locationAtom, location);
    },
    []
  );
  React.useEffect(() => {
    setLocation(location);
  }, [location, setLocation]);
};
