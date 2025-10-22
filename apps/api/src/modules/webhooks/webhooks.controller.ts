import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service.js';
import { RegisterWebhookDto } from './webhooks.dto.js';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Post('endpoints')
  registerEndpoint(@Body() dto: RegisterWebhookDto) {
    return this.webhooks.registerEndpoint(dto);
  }

  @Get('deliveries/:id')
  getDelivery(@Param('id') id: string) {
    return this.webhooks.getDelivery(id);
  }
}
