// Minimal Vitest globals so TypeScript can typecheck without the full package.
export declare const describe: (...args: any[]) => void;
export declare const it: (...args: any[]) => void;
export declare const expect: (...args: any[]) => any;
export declare const beforeEach: (...args: any[]) => void;
export declare const afterEach: (...args: any[]) => void;
export declare const vi: any;

declare global {
  const describe: typeof describe;
  const it: typeof it;
  const expect: typeof expect;
  const beforeEach: typeof beforeEach;
  const afterEach: typeof afterEach;
  const vi: typeof vi;
}
