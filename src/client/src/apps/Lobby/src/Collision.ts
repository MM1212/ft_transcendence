import { Collision } from '@shared/Lobby/Collision';
// @ts-expect-error browser version
import { PNG as PNGBrowser } from 'pngjs/browser';
import { type PNG as PNGNative } from 'pngjs';
import publicPath from '@utils/public';
import Worker from './Collision.worker?worker&inline';
const PNG: typeof PNGNative = PNGBrowser;

export class ClientCollision extends Collision {
  constructor() {
    super();
  }

  private collisionFileMapPath = publicPath('/lobby-mask.png');
  // client will be non-blocking so it doesnt hang the client
  async onMount(): Promise<void> {
    return await new Promise((r) => {
      console.log('boas');
      const worker = new Worker({});
      worker.onmessage = (ev) => {
        this.mapCollision = new PNG({
          filterType: 4,
          
        })
        const [width, height, buffer] = ev.data;
        this.mapCollision.width = width;
        this.mapCollision.height = height;
        this.mapCollision.data = buffer;
        worker.terminate();
        r();
      };
      worker.postMessage([`${document.location.origin}${this.collisionFileMapPath}`]);
    });
  }
}
