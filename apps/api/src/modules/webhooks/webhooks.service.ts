import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma.service.js';
import { RegisterWebhookDto } from './webhooks.dto.js';

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  registerEndpoint(dto: RegisterWebhookDto) {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.webhookEndpoint.create({
      data: ({
        tenantId,
        event: dto.event,
        targetUrl: dto.targetUrl,
        signingKey: dto.signingKey
      } as any)
    });
  }

  getDelivery(id: string) {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.webhookDelivery.findFirst({
      where: { id, tenantId },
      include: { endpoint: true }
    });
  }
}
