import type { INestApplication } from '@nestjs/common';

export declare class NestFactory {
  static create(module: unknown, options?: Record<string, unknown>): Promise<INestApplication>;
}
