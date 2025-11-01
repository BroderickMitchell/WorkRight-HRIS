import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

const globals = globalThis as typeof globalThis & {
  React: typeof import('react');
};

globals.React = React;

afterEach(() => {
  cleanup();
});
