import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommunicationsService } from './communications.service.js';
import { CreateCommunicationPostDto } from './dto/create-communication.dto.js';
import { UpdateCommunicationPostDto } from './dto/update-communication.dto.js';
import { ListCommunicationsQueryDto } from './dto/list-communications.dto.js';
import { ListAckItemsQueryDto } from './dto/list-acks.dto.js';
import { CanRequireAckGuard } from './guards/can-require-ack.guard.js';
import { IsRecipientGuard } from './guards/is-recipient.guard.js';

@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  list(@Query() query: ListCommunicationsQueryDto) {
    return this.communicationsService.listPosts(query);
  }

  @Get('context')
  context() {
    return this.communicationsService.getComposerContext();
  }

  @Get('acks/mine')
  getMyAcks(@Query() query: ListAckItemsQueryDto) {
    return this.communicationsService.listMyRequiredAcks(query);
  }

  @Post()
  @UseGuards(CanRequireAckGuard)
  create(@Body() dto: CreateCommunicationPostDto) {
    return this.communicationsService.createPost(dto);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.communicationsService.getPost(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommunicationPostDto) {
    return this.communicationsService.updatePost(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.communicationsService.deletePost(id);
  }

  @Post(':id/ack')
  @UseGuards(IsRecipientGuard)
  acknowledge(@Param('id') id: string) {
    return this.communicationsService.acknowledge(id);
  }

  @Get(':id/ack/summary')
  ackSummary(@Param('id') id: string) {
    return this.communicationsService.getAckSummary(id);
  }
}
