import "@testing-library/jest-dom";

// jsdom doesn't implement ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
