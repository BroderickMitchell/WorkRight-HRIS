// Simplified NestJS surface area used across the project. Provides enough typing
// for offline builds without pulling the heavy upstream packages.
export declare class Logger {
  constructor(context?: string);
  log(message: unknown, ...optionalParams: unknown[]): void;
  error(message: unknown, ...optionalParams: unknown[]): void;
  warn(message: unknown, ...optionalParams: unknown[]): void;
}

export declare class ValidationPipe {
  constructor(options?: Record<string, unknown>);
}

export declare class HttpException extends Error {
  constructor(message?: string, status?: number);
}

export declare class BadRequestException extends HttpException {}
export declare class ForbiddenException extends HttpException {}
export declare class NotFoundException extends HttpException {}
export declare class UnauthorizedException extends HttpException {}

export declare const HttpStatus: Record<string, number>;

export declare type ExecutionContext = unknown;
export declare type CallHandler<T = unknown> = {
  handle(): {
    pipe(...operators: unknown[]): unknown;
  };
};

export interface NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): unknown;
}

export declare function Injectable(): ClassDecorator;
export declare function Controller(prefix?: string): ClassDecorator;
export declare function Module(metadata?: Record<string, unknown>): ClassDecorator;
export declare function Global(): ClassDecorator;

export declare function Get(path?: string): MethodDecorator;
export declare function Post(path?: string): MethodDecorator;
export declare function Put(path?: string): MethodDecorator;
export declare function Patch(path?: string): MethodDecorator;
export declare function Delete(path?: string): MethodDecorator;
export declare function HttpCode(status: number): MethodDecorator;
export declare function Header(name: string, value: string): MethodDecorator;

export declare function Body(property?: string): ParameterDecorator;
export declare function Param(property?: string): ParameterDecorator;
export declare function Query(property?: string): ParameterDecorator;
export declare function Req(): ParameterDecorator;
export declare function Res(): ParameterDecorator;
export declare function UploadedFile(): ParameterDecorator;

export declare function UseGuards(...guards: unknown[]): MethodDecorator & ClassDecorator;
export declare function UseInterceptors(...interceptors: unknown[]): MethodDecorator & ClassDecorator;
export declare function SetMetadata(key: string, value: unknown): MethodDecorator & ClassDecorator;
export declare function Inject(token: unknown): ParameterDecorator;
export declare function Optional(): ParameterDecorator;

export interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}

export declare interface OnModuleInit {
  onModuleInit(): unknown;
}

export declare interface INestApplication {
  close(): Promise<void>;
  useLogger(logger: Logger): void;
  use(middleware: unknown): void;
  enableCors(options?: Record<string, unknown>): void;
  useGlobalPipes(...pipes: unknown[]): void;
  setGlobalPrefix(prefix: string, options?: Record<string, unknown>): void;
  get<T = unknown>(type: unknown): T;
  listen(port: number): Promise<void>;
}
