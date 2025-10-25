import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DirectoryService } from './directory.service.js';
import { CreateEmployeeDto } from './directory.dto.js';

@ApiTags('Directory')
@Controller('directory')
export class DirectoryController {
  constructor(private readonly directory: DirectoryService) {}

  @Post('employees')
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.directory.createEmployee(dto);
  }

  @Get('employees')
  listEmployees(@Query('search') search?: string) {
    return this.directory.listEmployees(search);
  }

  @Get('employees/:id')
  getEmployee(@Param('id') id: string) {
    return this.directory.getEmployeeProfile(id);
  }
}
