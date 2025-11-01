import type * as ReactTypes from 'react';

declare global {
  namespace React {
    // Provide React namespace bindings for generated Next.js types when using the React 18 automatic JSX runtime.
    // These declarations intentionally reference the module exports so they stay in sync with @types/react.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type ReactNode = ReactTypes.ReactNode;
    interface FormEvent<T = Element> extends ReactTypes.FormEvent<T> {}
    interface MouseEvent<T = Element, E = globalThis.MouseEvent>
      extends ReactTypes.MouseEvent<T, E> {}
  }
}

export {};
