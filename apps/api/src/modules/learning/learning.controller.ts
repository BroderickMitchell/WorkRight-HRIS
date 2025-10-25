import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LearningService } from './learning.service.js';
import { CreateCourseDto, AssignCourseDto } from './learning.dto.js';

@ApiTags('Learning')
@Controller('learning')
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Post('courses')
  createCourse(@Body() dto: CreateCourseDto) {
    return this.learning.createCourse(dto);
  }

  @Post('courses/:courseId/assignments')
  assignCourse(@Param('courseId') courseId: string, @Body() dto: AssignCourseDto) {
    return this.learning.assignCourse(courseId, dto);
  }

  @Get('catalogue')
  listCourses() {
    return this.learning.listCourses();
  }
}
