import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  tenantBrandingSchema,
  updateTenantBrandingSchema,
  type TenantBranding,
  type TenantBrandingAssetUpload,
} from '@workright/profile-schema';
import { PrismaService } from '../../common/prisma.service.js';
import { AuditService } from '../../common/audit.service.js';
import { ClsService } from 'nestjs-cls';
import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import { join, extname } from 'node:path';

interface AssetEntry {
  path: string;
  mimeType: string;
  updatedAt: string;
}

interface TenantSettings {
  branding: {
    primaryColor: string;
    accentColor: string;
    surfaceColor: string;
    darkMode: boolean;
  };
  assets: Record<string, AssetEntry>;
  emails: { supportEmail: string; subjectPrefix: string };
  legal: { address: string | null };
  maintenanceMode: boolean;
  updatedAt: string;
}

interface AssetDescriptor {
  filename: string;
  mimeType: string;
  buffer: Buffer;
  extension: string;
}

interface AssetStreamDescriptor {
  mimeType: string;
  stream: ReturnType<typeof createReadStream>;
}

@Injectable()
export class TenantBrandingService {
  private readonly storageRoot = join(process.cwd(), 'apps/api/storage');
  private readonly assetsRoot = join(this.storageRoot, 'tenant-assets');

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cls: ClsService,
  ) {
    if (!existsSync(this.assetsRoot)) {
      mkdirSync(this.assetsRoot, { recursive: true });
    }
  }

  private getTenantId(): string {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return tenantId;
  }

  private static asJson(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }

  private defaultSettings(): TenantSettings {
    return {
      branding: {
        primaryColor: '#004c97',
        accentColor: '#1c7ed6',
        surfaceColor: '#ffffff',
        darkMode: false,
      },
      assets: {},
      emails: { supportEmail: '', subjectPrefix: '' },
      legal: { address: null },
      maintenanceMode: false,
      updatedAt: new Date(0).toISOString(),
    };
  }

  private normaliseSettings(value: unknown): TenantSettings {
    const defaults = this.defaultSettings();
    if (typeof value !== 'object' || value === null) {
      return { ...defaults };
    }
    const raw = value as Record<string, unknown>;
    const branding =
      typeof raw.branding === 'object' && raw.branding !== null
        ? (raw.branding as Record<string, unknown>)
        : {};
    const assetsRaw =
      typeof raw.assets === 'object' && raw.assets !== null
        ? (raw.assets as Record<string, unknown>)
        : {};
    const emails =
      typeof raw.emails === 'object' && raw.emails !== null
        ? (raw.emails as Record<string, unknown>)
        : {};
    const legal =
      typeof raw.legal === 'object' && raw.legal !== null
        ? (raw.legal as Record<string, unknown>)
        : {};

    const assets = Object.entries(assetsRaw).reduce<Record<string, AssetEntry>>(
      (acc, [key, entry]) => {
        if (typeof entry !== 'object' || entry === null) return acc;
        const record = entry as Record<string, unknown>;
        if (
          typeof record.path !== 'string' ||
          typeof record.mimeType !== 'string'
        )
          return acc;
        const updatedAt =
          typeof record.updatedAt === 'string'
            ? record.updatedAt
            : defaults.updatedAt;
        acc[key] = { path: record.path, mimeType: record.mimeType, updatedAt };
        return acc;
      },
      {},
    );

    return {
      branding: {
        primaryColor:
          typeof branding.primaryColor === 'string'
            ? branding.primaryColor
            : defaults.branding.primaryColor,
        accentColor:
          typeof branding.accentColor === 'string'
            ? branding.accentColor
            : defaults.branding.accentColor,
        surfaceColor:
          typeof branding.surfaceColor === 'string'
            ? branding.surfaceColor
            : defaults.branding.surfaceColor,
        darkMode:
          typeof branding.darkMode === 'boolean'
            ? (branding.darkMode as boolean)
            : defaults.branding.darkMode,
      },
      assets,
      emails: {
        supportEmail:
          typeof emails.supportEmail === 'string'
            ? emails.supportEmail
            : defaults.emails.supportEmail,
        subjectPrefix:
          typeof emails.subjectPrefix === 'string'
            ? emails.subjectPrefix
            : defaults.emails.subjectPrefix,
      },
      legal: {
        address:
          typeof legal.address === 'string'
            ? legal.address
            : defaults.legal.address,
      },
      maintenanceMode:
        typeof raw.maintenanceMode === 'boolean'
          ? (raw.maintenanceMode as boolean)
          : defaults.maintenanceMode,
      updatedAt:
        typeof raw.updatedAt === 'string' ? raw.updatedAt : defaults.updatedAt,
    };
  }

  private assetsDir(tenantId: string): string {
    const dir = join(this.assetsRoot, tenantId);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  private buildAssetUrl(kind: string, asset?: AssetEntry): string | null {
    if (!asset?.path) return null;
    const version = asset.updatedAt
      ? `?v=${encodeURIComponent(asset.updatedAt)}`
      : '';
    return `/v1/tenant/branding/assets/${kind}${version}`;
  }

  private decodeAsset(upload: TenantBrandingAssetUpload): AssetDescriptor {
    const allowed = new Map<string, string>([
      ['image/png', 'png'],
      ['image/jpeg', 'jpg'],
      ['image/svg+xml', 'svg'],
      ['image/webp', 'webp'],
      ['image/gif', 'gif'],
      ['image/x-icon', 'ico'],
    ]);
    if (!allowed.has(upload.mimeType)) {
      throw new BadRequestException(
        `Unsupported asset type: ${upload.mimeType}`,
      );
    }
    const extension =
      allowed.get(upload.mimeType) ??
      (extname(upload.filename).replace('.', '') || 'png');
    const data = upload.data.includes(',')
      ? (upload.data.split(',').pop() ?? '')
      : upload.data;
    let buffer: Buffer;
    try {
      buffer = Buffer.from(data, 'base64');
    } catch {
      throw new BadRequestException('Invalid asset encoding');
    }
    if (!buffer.byteLength) {
      throw new BadRequestException('Empty asset payload');
    }
    const maxBytes = 5 * 1024 * 1024;
    if (buffer.byteLength > maxBytes) {
      throw new BadRequestException('Asset exceeds 5MB limit');
    }
    if (upload.mimeType === 'image/svg+xml') {
      const svg = buffer.toString('utf8');
      if (
        /<script/i.test(svg) ||
        /onload=/i.test(svg) ||
        /javascript:/i.test(svg)
      ) {
        throw new BadRequestException('SVG contains unsafe content');
      }
    }
    return {
      filename: upload.filename,
      mimeType: upload.mimeType,
      buffer,
      extension,
    };
  }

  private async saveAsset(
    tenantId: string,
    kind: string,
    upload: TenantBrandingAssetUpload,
  ): Promise<AssetEntry> {
    const asset = this.decodeAsset(upload);
    const dir = this.assetsDir(tenantId);
    const timestamp = Date.now();
    const filename = `${kind}-${timestamp}.${asset.extension}`;
    const payload = new Uint8Array(asset.buffer);
    await fs.writeFile(join(dir, filename), payload);
    return {
      path: filename,
      mimeType: asset.mimeType,
      updatedAt: new Date(timestamp).toISOString(),
    };
  }

  private async deleteAssetFile(tenantId: string, path: string) {
    const filePath = join(this.assetsDir(tenantId), path);
    await fs.unlink(filePath).catch(() => undefined);
  }

  private buildBranding(
    tenant: TenantRecord,
    settings: TenantSettings,
  ): TenantBranding {
    return tenantBrandingSchema.parse({
      primaryColor: settings.branding.primaryColor,
      accentColor: settings.branding.accentColor,
      surfaceColor: settings.branding.surfaceColor,
      darkMode: settings.branding.darkMode,
      logoUrl: this.buildAssetUrl('logo', settings.assets.logo),
      emailLogoUrl: this.buildAssetUrl('emailLogo', settings.assets.emailLogo),
      loginHeroUrl: this.buildAssetUrl('loginHero', settings.assets.loginHero),
      faviconUrl: this.buildAssetUrl('favicon', settings.assets.favicon),
      supportEmail: tenant.supportEmail ?? settings.emails.supportEmail,
      legalAddress: tenant.address ?? settings.legal.address ?? null,
      subjectPrefix: settings.emails.subjectPrefix ?? null,
      updatedAt: settings.updatedAt ?? tenant.updatedAt.toISOString(),
    });
  }

  async getBranding(): Promise<TenantBranding> {
    const tenantId = this.getTenantId();
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const settings = this.normaliseSettings(tenant.settings);
    return this.buildBranding(
      {
        id: tenant.id,
        settings: tenant.settings,
        supportEmail: tenant.supportEmail ?? null,
        address: tenant.address ?? null,
        updatedAt: tenant.updatedAt,
      },
      settings,
    );
  }

  async updateBranding(
    rawInput: Record<string, unknown>,
  ): Promise<TenantBranding> {
    const input = updateTenantBrandingSchema.parse(rawInput ?? {});
    const tenantId = this.getTenantId();
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const settings = this.normaliseSettings(tenant.settings);
    const now = new Date();

    settings.branding.primaryColor = input.primaryColor;
    settings.branding.accentColor = input.accentColor;
    settings.branding.surfaceColor =
      input.surfaceColor ?? settings.branding.surfaceColor;
    if (typeof input.darkMode === 'boolean') {
      settings.branding.darkMode = input.darkMode;
    }
    settings.emails.supportEmail = input.supportEmail;
    settings.emails.subjectPrefix = input.subjectPrefix ?? '';
    settings.legal.address = input.legalAddress ?? null;

    const assetUpdates: Array<Promise<void>> = [];
    const applyAsset = async (
      kind: 'logo' | 'emailLogo' | 'loginHero' | 'favicon',
      upload?: TenantBrandingAssetUpload,
      remove?: boolean,
    ) => {
      if (upload) {
        const entry = await this.saveAsset(tenantId, kind, upload);
        const existing = settings.assets[kind];
        if (existing?.path && existing.path !== entry.path) {
          await this.deleteAssetFile(tenantId, existing.path);
        }
        settings.assets[kind] = entry;
      } else if (remove) {
        const existing = settings.assets[kind];
        if (existing?.path) {
          await this.deleteAssetFile(tenantId, existing.path);
        }
        delete settings.assets[kind];
      }
    };

    assetUpdates.push(applyAsset('logo', input.logo, input.removeLogo));
    assetUpdates.push(
      applyAsset('emailLogo', input.emailLogo, input.removeEmailLogo),
    );
    assetUpdates.push(
      applyAsset('loginHero', input.loginHero, input.removeLoginHero),
    );
    assetUpdates.push(
      applyAsset('favicon', input.favicon, input.removeFavicon),
    );

    await Promise.all(assetUpdates);

    settings.updatedAt = now.toISOString();

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: TenantBrandingService.asJson(settings),
        supportEmail: input.supportEmail,
        address: input.legalAddress ?? null,
      },
      select: {
        id: true,
        settings: true,
        supportEmail: true,
        address: true,
        updatedAt: true,
      },
    });

    await this.audit.record({
      entity: 'tenant',
      entityId: tenantId,
      action: 'branding.updated',
      changes: {
        primaryColor: input.primaryColor,
        accentColor: input.accentColor,
        surfaceColor: input.surfaceColor ?? settings.branding.surfaceColor,
        darkMode:
          typeof input.darkMode === 'boolean'
            ? input.darkMode
            : settings.branding.darkMode,
      },
    });

    return this.buildBranding(updatedTenant, settings);
  }

  async getAsset(kind: string): Promise<AssetStreamDescriptor> {
    const tenantId = this.getTenantId();
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const settings = this.normaliseSettings(tenant.settings);
    const asset = settings.assets[kind];
    if (!asset?.path) {
      throw new NotFoundException('Asset not found');
    }
    const filePath = join(this.assetsDir(tenantId), asset.path);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Asset file missing');
    }
    return { mimeType: asset.mimeType, stream: createReadStream(filePath) };
  }
}

type TenantRecord = {
  id: string;
  settings: Prisma.JsonValue;
  supportEmail: string | null;
  address: string | null;
  updatedAt: Date;
};
