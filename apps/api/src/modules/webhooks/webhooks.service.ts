import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { RegisterWebhookDto } from './webhooks.dto.js';

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  registerEndpoint(dto: RegisterWebhookDto) {
    return this.prisma.webhookEndpoint.create({
      data: {
        event: dto.event,
        targetUrl: dto.targetUrl,
        signingKey: dto.signingKey
      }
    });
  }

  getDelivery(id: string) {
    return this.prisma.webhookDelivery.findUnique({
      where: { id },
      include: { endpoint: true }
    });
  }
}
