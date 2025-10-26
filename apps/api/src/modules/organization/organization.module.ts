import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module.js';
import { OrganizationController } from './organization.controller.js';

@Module({ imports: [PrismaModule], controllers: [OrganizationController] })
export class OrganizationModule {}

