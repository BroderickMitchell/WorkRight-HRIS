import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module.js';
import { CommunicationsController } from './communications.controller.js';
import { CommunicationsService } from './communications.service.js';
import { CommunicationsNotificationService } from './communications.notifications.js';
import { IsRecipientGuard } from './guards/is-recipient.guard.js';
import { CanRequireAckGuard } from './guards/can-require-ack.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [CommunicationsController],
  providers: [CommunicationsService, CommunicationsNotificationService, IsRecipientGuard, CanRequireAckGuard],
  exports: [CommunicationsService]
})
export class CommunicationsModule {}
