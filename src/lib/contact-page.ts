import type { ContactStatus } from './contact';

export type ContactPageStatus = Exclude<ContactStatus, 'success'>;

export const CONTACT_PAGE_STATUSES: ContactPageStatus[] = ['invalid', 'captcha', 'error'];

export const CONTACT_PAGE_STATUS_MESSAGES: Record<ContactPageStatus, string> = {
  invalid: 'Please review the form and provide a valid name, email, and message.',
  captcha: 'CAPTCHA verification failed. Please try again.',
  error: 'Something went wrong while sending your message. Please try again shortly.',
};

export function parseContactPageStatus(statusParam: string | null): ContactPageStatus | null {
  if (!statusParam) {
    return null;
  }

  return CONTACT_PAGE_STATUSES.includes(statusParam as ContactPageStatus)
    ? (statusParam as ContactPageStatus)
    : null;
}
