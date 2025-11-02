import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CommunicationsNotificationService {
  private readonly logger = new Logger(CommunicationsNotificationService.name);

  queuePostCreated(postId: string, recipientUserIds: string[]) {
    this.logger.debug(`Queued communication post created notification`, postId);
    this.logger.verbose(
      `Post ${postId} recipients (${recipientUserIds.length}): ${recipientUserIds.join(', ')}`
    );
  }

  queuePostRequiresAck(postId: string, recipientUserIds: string[], ackDueAt?: Date | null) {
    const dueInfo = ackDueAt ? ` due ${ackDueAt.toISOString()}` : '';
    this.logger.debug(`Queued acknowledgement notification for post ${postId}${dueInfo}`);
    this.logger.verbose(
      `Acknowledgement recipients (${recipientUserIds.length}): ${recipientUserIds.join(', ')}`
    );
  }
}
