import { Module } from '@nestjs/common';
import { RostersController } from './rosters.controller.js';
import { RostersService } from './rosters.service.js';

@Module({
  controllers: [RostersController],
  providers: [RostersService]
})
export class RostersModule {}

