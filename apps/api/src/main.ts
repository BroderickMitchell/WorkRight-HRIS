import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './modules/app.module.js';
import { PrismaService } from './common/prisma.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');
  app.useLogger(logger);
  app.use(helmet());
  app.enableCors({
    origin: /localhost:\d+$/,
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
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

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}`);
}

bootstrap();
