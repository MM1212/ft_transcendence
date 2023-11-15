import React from 'react';
import { useRecoilSnapshot } from 'recoil';

export function DebugObserver(): null {
  const snapshot = useRecoilSnapshot();

  React.useEffect(() => {
    console.debug('The following atoms were modified:');
    for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      console.debug(node.key, snapshot.getLoadable(node), snapshot.getInfo_UNSTABLE(node));
    }
  }, [snapshot]);

  return null;
}
