import { describe, expect, test } from 'bun:test';
import { type ContactSubmission } from './contact';
import {
  buildContactSubmissionDocument,
  hashRemoteIp,
  sanitizeDeliveryError,
} from './contact-store';

const baseSubmission: ContactSubmission = {
  name: 'Chris Zombik',
  email: 'chris@example.com',
  message: 'Hello there, this message is long enough to pass validation.',
  company: '',
  captchaToken: 'token-value',
};

describe('contact store payload', () => {
  test('builds queued submission document with expected defaults', () => {
    const document = buildContactSubmissionDocument(
      {
        submission: baseSubmission,
        remoteIp: '203.0.113.42',
        metadata: {
          userAgent: 'Mozilla/5.0 test agent',
        },
      },
      {
        id: 'contactSubmission.fixed',
        now: new Date('2026-02-12T12:00:00.000Z'),
      },
    );

    expect(document._id).toBe('contactSubmission.fixed');
    expect(document._type).toBe('contactSubmission');
    expect(document.deliveryStatus).toBe('queued');
    expect(document.deliveryAttempts).toBe(1);
    expect(document.deliveryProvider).toBe('resend');
    expect(document.captchaPassed).toBe(true);
    expect(document.source).toBe('contact-form');
    expect(document.receivedAt).toBe('2026-02-12T12:00:00.000Z');
    expect(document.remoteIpHash?.length).toBe(64);
  });

  test('hashRemoteIp is deterministic and does not return raw ip', () => {
    const first = hashRemoteIp('198.51.100.1');
    const second = hashRemoteIp('198.51.100.1');

    expect(first).toBe(second);
    expect(first).not.toBe('198.51.100.1');
    expect(first?.length).toBe(64);
  });

  test('sanitizeDeliveryError truncates and normalizes text', () => {
    const raw = new Error(`Line one\nline two ${'x'.repeat(700)}`);
    const result = sanitizeDeliveryError(raw);

    expect(result.includes('\n')).toBe(false);
    expect(result.length).toBeLessThanOrEqual(500);
  });
});
