import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class MockAudioContext {
  createGain() {
    return {
      connect: () => {},
      disconnect: () => {},
      gain: { value: 0.3 },
    };
  }
  createOscillator() {
    return {
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { value: 0 },
      type: 'sine',
    };
  }
  resume() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
  get destination() { return {}; }
  get state() { return 'running'; }
  get currentTime() { return 0; }
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: MockAudioContext,
});
