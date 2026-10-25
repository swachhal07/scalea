// Renders the 3D objects off the main thread, so shader compiles and the environment
// map never block scrolling. Each finished frame goes back as an ImageBitmap.
import { createStage } from './scene3d.js';

let stage = null;

self.onmessage = ({ data }) => {
  if (data.type === 'init') {
    try {
      stage = createStage({
        canvas: new OffscreenCanvas(1, 1),
        still: data.still,
        present(id, source) {
          const bitmap = source.transferToImageBitmap();
          self.postMessage({ type: 'frame', id, bitmap }, [bitmap]);
        },
      });
    } catch {
      // Some browsers have OffscreenCanvas without WebGL; the page then renders on the main thread.
      self.postMessage({ type: 'unsupported' });
      return;
    }
    self.postMessage({ type: 'ready' });
    return;
  }
  stage?.[data.type](...data.args);
};
