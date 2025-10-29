export declare class DocumentBuilder {
  setTitle(title: string): this;
  setDescription(description: string): this;
  setVersion(version: string): this;
  addBearerAuth(): this;
  build(): Record<string, unknown>;
}

export declare class SwaggerModule {
  static createDocument(app: unknown, config: Record<string, unknown>): Record<string, unknown>;
  static setup(path: string, app: unknown, document: Record<string, unknown>): void;
}

export declare function ApiTags(...tags: string[]): ClassDecorator;
