// Lightweight Node.js type facades so TypeScript can compile in offline CI.
// These stubs intentionally cover only the APIs touched in source files.
type Buffer = Uint8Array & { toString(encoding?: string): string };

declare const Buffer: {
  from(input: string | Buffer, encoding?: string): Buffer;
  concat(list: readonly Buffer[], totalLength?: number): Buffer;
};

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
    cwd(): string;
  }

  interface WritableStream {
    write(chunk: any, encoding?: string, callback?: () => void): boolean;
    end(chunk?: any, encoding?: string, callback?: () => void): void;
  }

  interface ReadableStream {
    on(event: 'data', listener: (chunk: any) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: any) => void): this;
    pipe<T extends WritableStream>(destination: T, options?: { end?: boolean }): T;
  }
}

declare const process: NodeJS.Process;

declare module 'node:fs' {
  export function createReadStream(...args: any[]): any;
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: any): any;
  export const promises: {
    readFile(path: string, options?: any): Promise<string | Buffer>;
    writeFile(path: string, data: any, options?: any): Promise<void>;
    unlink(path: string): Promise<void>;
    mkdir(path: string, options?: any): Promise<void>;
    stat(path: string): Promise<any>;
  };
}

declare module 'node:stream' {
  class PassThrough implements NodeJS.ReadableStream, NodeJS.WritableStream {
    on(event: 'data', listener: (chunk: any) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: any) => void): this;
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean }): T;
  }

  export { PassThrough };
}

declare module 'stream' {
  export * from 'node:stream';
}

declare module 'node:path' {
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function resolve(...paths: string[]): string;
}

declare module 'node:crypto' {
  export function randomUUID(): string;
}

// Fallback aliases for non-prefixed imports if needed
declare module 'fs' {
  export * from 'node:fs';
}

declare module 'path' {
  export * from 'node:path';
}

declare module 'crypto' {
  export * from 'node:crypto';
}
