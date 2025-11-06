import { BadRequestException, Injectable } from '@nestjs/common';
import { FieldMapSource, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service.js';

const ALLOWED_PROFILE_SECTIONS = new Set<
  | 'BANK_DETAILS'
  | 'TAX_KIWISAVER'
  | 'SUPERANNUATION'
  | 'EMERGENCY_CONTACT'
  | 'PERSONAL_CONTACT'
  | 'DIVERSITY'
  | 'ADDITIONAL_INFO'
>([
  'BANK_DETAILS',
  'TAX_KIWISAVER',
  'SUPERANNUATION',
  'EMERGENCY_CONTACT',
  'PERSONAL_CONTACT',
  'DIVERSITY',
  'ADDITIONAL_INFO'
]);

@Injectable()
export class WorkflowFieldMapService {
  constructor(private readonly prisma: PrismaService) {}

  async validatePlaceholders(tenantId: string, placeholderKeys: string[]): Promise<void> {
    if (!placeholderKeys.length) return;
    const unique = Array.from(new Set(placeholderKeys.filter((key) => key.trim().length > 0)));
    if (!unique.length) return;

    const mappings = await this.prisma.fieldMap.findMany({
      where: {
        tenantId,
        source: FieldMapSource.EMAIL_PLACEHOLDER,
        sourceKey: { in: unique }
      }
    });

    const found = new Set(mappings.map((m) => m.sourceKey));
    const missing = unique.filter((key) => !found.has(key));
    if (missing.length) {
      throw new BadRequestException(
        `Missing field mappings for placeholders: ${missing.join(', ')}`
      );
    }

    const unresolvedRequired = mappings.filter((m) => m.required && !m.targetPath);
    if (unresolvedRequired.length) {
      throw new BadRequestException(
        `Required placeholders missing target paths: ${unresolvedRequired
          .map((m) => m.sourceKey)
          .join(', ')}`
      );
    }
  }

  async upsertMapping(data: Prisma.FieldMapUncheckedCreateInput) {
    return this.prisma.fieldMap.upsert({
      where: {
        tenantId_source_sourceKey: {
          tenantId: data.tenantId,
          source: data.source,
          sourceKey: data.sourceKey
        }
      },
      update: {
        targetPath: data.targetPath,
        transform: data.transform,
        fallback: data.fallback,
        required: data.required
      },
      create: data
    });
  }

  ensureProfileSectionsValid(sections: string[]): void {
    const invalid = sections.filter((section) => !ALLOWED_PROFILE_SECTIONS.has(section as any));
    if (invalid.length) {
      throw new BadRequestException(
        `Unsupported profile sections selected: ${invalid.join(', ')}`
      );
    }
  }
}
