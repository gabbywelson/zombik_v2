import { describe, expect, test } from 'bun:test';
import {
  CONTACT_PAGE_STATUS_MESSAGES,
  CONTACT_PAGE_STATUSES,
  parseContactPageStatus,
} from './contact-page';

describe('contact page status parsing', () => {
  test('returns known error statuses', () => {
    expect(parseContactPageStatus('invalid')).toBe('invalid');
    expect(parseContactPageStatus('captcha')).toBe('captcha');
    expect(parseContactPageStatus('error')).toBe('error');
  });

  test('returns null for success and unknown values', () => {
    expect(parseContactPageStatus('success')).toBeNull();
    expect(parseContactPageStatus('bogus')).toBeNull();
    expect(parseContactPageStatus('')).toBeNull();
    expect(parseContactPageStatus(null)).toBeNull();
  });

  test('status constants and message map stay aligned', () => {
    expect(CONTACT_PAGE_STATUSES).toEqual(['invalid', 'captcha', 'error']);

    for (const status of CONTACT_PAGE_STATUSES) {
      expect(CONTACT_PAGE_STATUS_MESSAGES[status].length).toBeGreaterThan(0);
    }
  });
});
