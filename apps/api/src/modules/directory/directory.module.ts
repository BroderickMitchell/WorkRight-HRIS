import { Module } from '@nestjs/common';
import { DirectoryController } from './directory.controller.js';
import { DirectoryService } from './directory.service.js';
import { PrismaModule } from '../../common/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DirectoryController],
  providers: [DirectoryService]
})
export class DirectoryModule {}
