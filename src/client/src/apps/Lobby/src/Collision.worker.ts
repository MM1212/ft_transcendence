// @ts-expect-error browser version
import { PNG } from 'pngjs/browser';
console.log('collision worker loaded');

self.onmessage = async (ev) => {
  const [path] = ev.data;
  console.log('spawned collision worker for ', path);
  const file = await fetch(path).then((res) => res.arrayBuffer());
  new PNG({
    filterType: 4,
  }).parse(file, (err: Error, data: any) => {
    if (err) throw err;
    console.log('collision worker done for ', path);
    self.postMessage([
      data.width,
      data.height,
      data.data]);
  });
};
