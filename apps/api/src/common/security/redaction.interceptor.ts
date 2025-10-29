import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Simple field-level redaction based on role membership.
// If a response object contains one of the sensitive keys below and the caller
// does not hold any of the allowed roles, the value is redacted.

const SENSITIVE_KEYS: Record<string, { allowed: string[] }> = {
  // Payroll/pay
  baseRateCents: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  amountCents: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  totalCents: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  // Banking
  bsb: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  accountNumber: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  bankName: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  // Tax/TFN
  tfn: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  taxFileNumber: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  // Superannuation
  superMemberNo: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  superUsi: { allowed: ['PAYROLL', 'HR_ADMIN'] },
  superFund: { allowed: ['PAYROLL', 'HR_ADMIN'] }
};

function redactValue(value: unknown, roles: string[]): unknown {
  if (Array.isArray(value)) return value.map((v) => redactValue(v, roles));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const policy = SENSITIVE_KEYS[k];
      if (policy) {
        const allowed = roles.some((r) => policy.allowed.includes(r));
        if (!allowed) {
          // Preserve type shape where possible
          out[k] = typeof v === 'number' ? null : 'REDACTED';
          continue;
        }
      }
      out[k] = redactValue(v, roles);
    }
    return out;
  }
  return value;
}

@Injectable()
export class RedactionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const roles = Array.isArray(req.appRoles)
      ? req.appRoles
      : Array.isArray(req.user?.roles)
        ? (req.user.roles as string[])
        : [];
    return next.handle().pipe(map((data) => redactValue(data, roles)));
  }
}

