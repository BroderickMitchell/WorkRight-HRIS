import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeaveService } from './leave.service.js';
import { CreateLeaveRequestDto } from './leave.dto.js';

@ApiTags('Leave')
@Controller('leave')
export class LeaveController {
  constructor(private readonly leave: LeaveService) {}

  @Post('requests')
  requestLeave(@Body() dto: CreateLeaveRequestDto) {
    return this.leave.requestLeave(dto);
  }

  @Get('requests/:id')
  getLeave(@Param('id') id: string) {
    return this.leave.getLeave(id);
  }

  @Get('balances/:employeeId')
  getBalances(@Param('employeeId') employeeId: string) {
    return this.leave.getBalances(employeeId);
  }
}
