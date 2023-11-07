import React from "react";

export const useKeybindsToggle = <T extends string[]>(
  keys: T,
  handler: (
    key: T[number],
    pressed: boolean,
    ev: KeyboardEvent
  ) => void | Promise<void>,
  deps: React.DependencyList
) => {
  React.useEffect(() => {
    const keyHandler = (down: boolean) => (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      console.log(ev.code, down, ev.repeat);

      keys.includes(ev.code) && handler(ev.code, down, ev);
    };
    const keydownHandler = keyHandler(true);
    const keyupHandler = keyHandler(false);
    document.addEventListener("keydown", keydownHandler);
    document.addEventListener("keyup", keyupHandler);
    return () => {
      document.removeEventListener("keydown", keydownHandler);
      document.removeEventListener("keyup", keyupHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handler, keys, ...deps]);
};

