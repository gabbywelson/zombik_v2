import { describe, expect, test } from 'bun:test';
import {
  isHoneypotTriggered,
  parseContactSubmission,
  validateContactSubmission,
} from './contact';

function buildValidFormData(): FormData {
  const formData = new FormData();
  formData.set('name', 'Chris Zombik');
  formData.set('email', 'chris@example.com');
  formData.set('message', 'Hello there, this is a valid contact message.');
  formData.set('company', '');
  formData.set('cf-turnstile-response', 'token-value');
  return formData;
}

describe('contact validation', () => {
  test('accepts a valid submission', () => {
    const submission = parseContactSubmission(buildValidFormData());
    const result = validateContactSubmission(submission);

    expect(result.ok).toBe(true);
    expect(result.data?.name).toBe('Chris Zombik');
    expect(result.data?.email).toBe('chris@example.com');
  });

  test('rejects an invalid email', () => {
    const formData = buildValidFormData();
    formData.set('email', 'invalid-email');

    const result = validateContactSubmission(parseContactSubmission(formData));

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Email'))).toBe(true);
  });

  test('rejects a too-short message', () => {
    const formData = buildValidFormData();
    formData.set('message', 'Too short');

    const result = validateContactSubmission(parseContactSubmission(formData));

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Message'))).toBe(true);
  });

  test('detects honeypot submissions', () => {
    expect(isHoneypotTriggered('')).toBe(false);
    expect(isHoneypotTriggered('Acme Corp')).toBe(true);
  });
});
