import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { randomUUID } from 'node:crypto';
import type { DocumentFormat } from '@workright/profile-schema';

interface GeneratedArtifact {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

@Injectable()
export class DocumentGenerationService {
  renderTemplate(template: string, data: Record<string, unknown>): string {
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, token: string) => {
      const value = token.split('.').reduce<unknown>((acc, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
          return (acc as Record<string, unknown>)[part];
        }
        return undefined;
      }, data);
      if (value === undefined || value === null) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      try {
        return JSON.stringify(value);
      } catch {
        return '';
      }
    });
  }

  async generate(
    format: DocumentFormat,
    templateName: string,
    body: string,
    data: Record<string, unknown>
  ): Promise<GeneratedArtifact> {
    const merged = this.renderTemplate(body, data);
    if (format === 'PDF') {
      return this.generatePdf(merged, templateName);
    }
    return this.generateDocx(merged, templateName);
  }

  private generatePdf(content: string, templateName: string): Promise<GeneratedArtifact> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 72 });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            buffer,
            mimeType: 'application/pdf',
            filename: `${this.normaliseFilename(templateName)}-${randomUUID()}.pdf`
          });
        });
        doc.on('error', (err: unknown) => reject(err));
        doc.fontSize(18).text(templateName, { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(content, { lineGap: 6 });
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generateDocx(content: string, templateName: string): Promise<GeneratedArtifact> {
    const paragraphs = content.split(/\n{2,}/).map((block) => {
      const lines = block.split(/\n/).map((line) => new TextRun(line));
      return new Paragraph({ children: lines.length ? lines : [new TextRun('')] });
    });
    const document = new Document({
      sections: [
        {
          properties: {},
          children: [new Paragraph({ children: [new TextRun({ text: templateName, bold: true, size: 28 })] }), ...paragraphs]
        }
      ]
    });
    const buffer = await Packer.toBuffer(document);
    return {
      buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: `${this.normaliseFilename(templateName)}-${randomUUID()}.docx`
    };
  }

  private normaliseFilename(value: string): string {
    const cleaned = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    return cleaned || 'document';
  }
}
