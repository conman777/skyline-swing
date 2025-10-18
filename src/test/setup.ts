import { vi } from 'vitest';

// Mock canvas and WebGL for Phaser
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
    // Return a proper mock context with all necessary properties
    const mockContext = {
      canvas: {
        width: 800,
        height: 600,
        style: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getAttribute: vi.fn(),
        setAttribute: vi.fn(),
      },
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
      })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    };
    return mockContext;
  }) as any;
}

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16);
}) as any;

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});
