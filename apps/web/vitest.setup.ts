import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

declare global {
  // eslint-disable-next-line no-var
  var React: typeof React;
}

globalThis.React = React;

afterEach(() => {
  cleanup();
});
