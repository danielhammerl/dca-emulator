import sdl from "@kmamal/sdl";

let window: any | undefined;
let param = 4;

export const initGpu = () => {
  window = sdl.video.createWindow({
    title: "Hello, World!",
  });

  setInterval(() => {
    render();
  }, 2000);
};

const render = () => {
  if (!window) {
    return;
  }

  const { width, height } = window;
  const stride = width * 4;
  const buffer = Buffer.alloc(stride * height);

  let offset = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      buffer[offset++] = Math.floor((256 * i) / height); // R
      buffer[offset++] = Math.floor((256 * j) / width); // G
      buffer[offset++] = 0; // B
      buffer[offset++] = 255; // A
    }
  }

  window.render(width, height, stride, "rgba32", buffer);
};
