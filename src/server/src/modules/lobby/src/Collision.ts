import { Collision } from '@shared/Lobby/Collision';
import fs from 'fs';
import { PNG } from 'pngjs';

export class ServerCollision extends Collision {
  constructor() {
    super();
  }
  private collisionFileMapPath: string = 'dist/assets/lobby/mask.png';
  async onMount(): Promise<void> {
    const stream = fs.createReadStream(this.collisionFileMapPath);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const instance = this;
    return await new Promise((res) => {
      stream
        .pipe(
          new PNG({
            filterType: 4,
          }),
        )
        .on('parsed', function () {
          instance.mapCollision = this;
          res();
        });
    });
  }
}
