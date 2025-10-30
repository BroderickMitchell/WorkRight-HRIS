import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('merges truthy class names', () => {
    expect(cn('base', 'primary', undefined, null, false)).toBe('base primary');
  });

  it('deduplicates tailwind class names', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
