import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import { AppModule } from './modules/app.module.js';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

const prisma = new PrismaClient();

async function smokeTestDatabase() {
  try {
    const result = await prisma.$queryRawUnsafe<{ now: Date }[]>(
      'SELECT NOW() as now'
    );
    console.log('DB OK, NOW() =', result?.[0]?.now);
    return true;
  } catch (err) {
    console.error('DB connection failed:', err);
    return false;
  } finally {
    await prisma.$disconnect().catch((disconnectError) => {
      console.error('Failed to disconnect Prisma after smoke test:', disconnectError);
    });
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isCloudRun = process.env.CLOUD_RUN === 'true';

  // Create app first so it can start listening quickly
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(logger);

  // Security headers
  app.use(helmet());

  // Config
  const configService = app.get(ConfigService);
  const demoMode = configService.get<boolean>('demoMode') ?? false;
  const allowedOrigins = configService.get<string[]>('security.allowedOrigins') ?? [];
  const corsAllowList: Array<string | RegExp> =
    allowedOrigins.length > 0 ? allowedOrigins : [/^https?:\/\/localhost:\d+$/];

  // CORS with allow-list
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const permitted = corsAllowList.some((entry) =>
        entry instanceof RegExp ? entry.test(origin) : entry === origin
      );
      return permitted
        ? callback(null, true)
        : callback(new Error(`CORS origin not allowed: ${origin}`), false);
    },
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // API prefix (keep /health unprefixed)
  app.setGlobalPrefix('v1', { exclude: ['health'] });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('WorkRight HRIS API')
    .setDescription('Versioned API for WorkRight HRIS tenants')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Auth guard (only when not in demo mode)
  if (demoMode) {
    logger.warn('API running with DEMO_MODE enabled. Header-based tenant and role overrides are accepted.');
  } else {
    const jwtGuard = app.get(JwtAuthGuard);
    app.useGlobalGuards(jwtGuard);
  }

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Start listening FIRST (critical for Cloud Run)
  const port = Number(process.env.PORT ?? 8080);
  await app.listen(port, '0.0.0.0');
  logger.log(`API listening on http://0.0.0.0:${port}`);

  // Test database AFTER app is listening (non-blocking for Cloud Run health checks)
  if (isCloudRun) {
    // Don't block startup - test database in background
    smokeTestDatabase().then((success) => {
      if (success) {
        logger.log('Database connection verified');
      } else {
        logger.warn('Database connection failed - app running but DB calls may fail');
      }
    });
  } else {
    // Local development - fail fast if DB is down
    const dbReady = await smokeTestDatabase();
    if (!dbReady) {
      logger.error('Database not ready - exiting');
      process.exit(1);
    }
  }
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
