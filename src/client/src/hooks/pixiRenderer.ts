import * as Pixi from 'pixi.js';
import React from 'react';

export const usePixiRenderer = (
  ref: React.RefObject<HTMLDivElement>,
  onMount: (
    app: Pixi.Application
  ) =>
    | (() => void | Promise<void>)
    | Promise<() => void | Promise<void>>
    | void,
  options?: Partial<Pixi.IApplicationOptions>
) => {
  React.useEffect(() => {
    if (!ref.current) return;
    const app = new Pixi.Application({
      width: ref.current.clientWidth,
      height: ref.current.clientHeight,
      backgroundColor: 0x000000,
      ...options,
    });
    app.stage.width = ref.current.clientWidth;
    app.stage.height = ref.current.clientHeight;
    app.view.width = ref.current.clientWidth;
    app.view.height = ref.current.clientHeight;
    ref.current.appendChild(app.view as HTMLCanvasElement);
    let cleanup = onMount(app);

    return () => {
      if (cleanup) {
        if (cleanup! instanceof Promise) cleanup = Promise.resolve(cleanup);
        (cleanup as Promise<any>).then((cleanup) => {
          cleanup();
          app.destroy();
        });
      } else app.destroy();
    };
  }, [ref, onMount, options]);
};

export { Pixi };
