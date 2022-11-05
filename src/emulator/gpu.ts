import sdl from "@kmamal/sdl";
import throttle from "lodash.throttle";

const WINDOW_HEIGHT = 150;
const WINDOW_WIDTH = 150;

const scale = 5;

let window = sdl.video.createWindow({
  title: "dca-emulator video adapter",
  accelerated: true,
  width: WINDOW_WIDTH * scale,
  height: WINDOW_HEIGHT * scale,
});

const { width, height } = window;
const stride = width * 4;
const videoBuffer = Buffer.alloc(height * stride);

export type GpuPixel = {
  xPos: number;
  yPos: number;
  color: {
    red: number;
    green: number;
    blue: number;
  };
};

// special thanks goes to my 5th grade math teacher here
export const draw = (pixel: GpuPixel) => {
  const pixelInBufferIndex = pixel.yPos * window.height * 4 * scale + pixel.xPos * 4 * scale;

  for (let xOffset = 0; xOffset < scale; xOffset++) {
    for (let yOffset = 0; yOffset < scale; yOffset++) {
      const offset = xOffset * 4 + yOffset * window.height * 4;
      videoBuffer[pixelInBufferIndex + offset] = pixel.color.red;
      videoBuffer[pixelInBufferIndex + offset + 1] = pixel.color.green;
      videoBuffer[pixelInBufferIndex + offset + 2] = pixel.color.blue;
      videoBuffer[pixelInBufferIndex + offset + 3] = 255;
    }
  }

  rerender();
};

// dont rerender on every tick,
const rerender = throttle(() => window.render(width, height, stride, "rgba32", videoBuffer), 40);

export const clear = () => {
  videoBuffer.fill(0);
};
