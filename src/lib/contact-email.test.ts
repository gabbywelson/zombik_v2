import { describe, expect, test } from 'bun:test';
import { CONTACT_EMAIL, decodeEmail, encodeEmail, rotate } from './contact-email';

describe('rotate', () => {
  test('is its own inverse', () => {
    const samples = ['hello', 'Hello World', 'abc123XYZ', 'first.last+tag', ''];
    for (const sample of samples) {
      expect(rotate(rotate(sample))).toBe(sample);
    }
  });

  test('changes every letter and digit but leaves punctuation alone', () => {
    expect(rotate('abc.xyz-019')).toBe('nop.klm-564');
  });
});

describe('encodeEmail / decodeEmail', () => {
  test('round-trips an address', () => {
    const address = 'someone.else+news@example-mail.co.uk';
    const encoded = encodeEmail(address);
    expect(encoded.user).not.toContain('@');
    expect(encoded.domain).not.toContain('@');
    expect(encoded.user).not.toBe('someone.else+news');
    expect(decodeEmail(encoded)).toBe(address);
  });

  test('rejects strings that are not addresses', () => {
    expect(() => encodeEmail('nope')).toThrow();
    expect(() => encodeEmail('@example.com')).toThrow();
    expect(() => encodeEmail('someone@')).toThrow();
  });
});

describe('CONTACT_EMAIL', () => {
  test('decodes to a well-formed address', () => {
    expect(decodeEmail(CONTACT_EMAIL)).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('is not stored in plain text', () => {
    expect(decodeEmail(CONTACT_EMAIL)).not.toBe(`${CONTACT_EMAIL.user}@${CONTACT_EMAIL.domain}`);
  });
});
