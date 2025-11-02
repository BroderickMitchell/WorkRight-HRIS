import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service.js';

@Injectable()
export class IsRecipientGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const postId = request.params?.id;
    if (!postId) throw new NotFoundException('Communication post not found');

    const tenantId: string | undefined = request.tenantId;
    const userId: string | undefined = request.user?.id;
    if (!tenantId || !userId) {
      throw new UnauthorizedException('Missing tenant or user context');
    }

    const recipient = await this.prisma.communicationPostRecipient.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { tenantId: true }
    });
    if (!recipient) {
      throw new ForbiddenException('Not a required recipient for this communication');
    }
    if (recipient.tenantId !== tenantId) {
      throw new ForbiddenException('Tenant mismatch for recipient');
    }
    return true;
  }
}
