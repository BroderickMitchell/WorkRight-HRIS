import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './modules/app.module.js';
import { PrismaService } from './common/prisma.service.js';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');
  app.useLogger(logger);
  app.use(helmet());

  const configService = app.get(ConfigService);
  const demoMode = configService.get<boolean>('demoMode') ?? false;
  const allowedOrigins = configService.get<string[]>('security.allowedOrigins') ?? [];
  const corsAllowList: Array<string | RegExp> =
    allowedOrigins.length > 0 ? allowedOrigins : [/^https?:\/\/localhost:\d+$/];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const permitted = corsAllowList.some((entry) =>
        entry instanceof RegExp ? entry.test(origin) : entry === origin
      );
      if (permitted) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`), false);
    },
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );
  app.setGlobalPrefix('v1', { exclude: ['health'] });

  const config = new DocumentBuilder()
    .setTitle('WorkRight HRIS API')
    .setDescription('Versioned API for WorkRight HRIS tenants')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  if (demoMode) {
    logger.warn('API running with DEMO_MODE enabled. Header-based tenant and role overrides are accepted.');
  } else {
    const jwtGuard = app.get(JwtAuthGuard);
    app.useGlobalGuards(jwtGuard);
  }

  const prismaService = app.get(PrismaService);
  prismaService.setupShutdownHooks(app);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}`);
}

bootstrap();
