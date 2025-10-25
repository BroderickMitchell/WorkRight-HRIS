import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller.js';

@Module({
  controllers: [SeedController]
})
export class AdminModule {}

