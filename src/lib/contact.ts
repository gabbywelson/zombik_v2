export type ContactStatus = 'success' | 'invalid' | 'captcha' | 'error';

export interface RawContactSubmission {
  name: string;
  email: string;
  message: string;
  company: string;
  captchaToken: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  company: string;
  captchaToken: string;
}

export interface ContactValidationResult {
  ok: boolean;
  errors: string[];
  data?: ContactSubmission;
}

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formValueAsString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

export function parseContactSubmission(formData: FormData): RawContactSubmission {
  return {
    name: formValueAsString(formData.get('name')),
    email: formValueAsString(formData.get('email')),
    message: formValueAsString(formData.get('message')),
    company: formValueAsString(formData.get('company')),
    captchaToken: formValueAsString(formData.get('cf-turnstile-response')),
  };
}

export function isHoneypotTriggered(company: string): boolean {
  return company.trim().length > 0;
}

export function validateContactSubmission(
  input: RawContactSubmission,
): ContactValidationResult {
  const data: ContactSubmission = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
    company: input.company.trim(),
    captchaToken: input.captchaToken.trim(),
  };

  const errors: string[] = [];

  if (data.name.length < NAME_MIN_LENGTH || data.name.length > NAME_MAX_LENGTH) {
    errors.push(`Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`);
  }

  if (data.email.length === 0 || data.email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(data.email)) {
    errors.push('Email must be a valid email address.');
  }

  if (
    data.message.length < MESSAGE_MIN_LENGTH ||
    data.message.length > MESSAGE_MAX_LENGTH
  ) {
    errors.push(
      `Message must be between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters.`,
    );
  }

  if (data.captchaToken.length === 0) {
    errors.push('CAPTCHA token is required.');
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    errors: [],
    data,
  };
}

interface TurnstileVerifyResponse {
  success: boolean;
}

export interface VerifyTurnstileTokenInput {
  token: string;
  secretKey: string;
  remoteIp?: string;
  fetcher?: typeof fetch;
}

export async function verifyTurnstileToken({
  token,
  secretKey,
  remoteIp,
  fetcher = fetch,
}: VerifyTurnstileTokenInput): Promise<boolean> {
  if (!secretKey || !token) {
    return false;
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
  });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  const response = await fetcher(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as TurnstileVerifyResponse;
  return payload.success === true;
}

export function extractRemoteIp(
  request: Request,
  clientAddress?: string,
): string | undefined {
  const fallback = clientAddress?.trim();
  if (fallback) {
    return fallback;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (!forwardedFor) {
    return undefined;
  }

  const firstIp = forwardedFor.split(',')[0]?.trim();
  return firstIp || undefined;
}

export function formatContactEmailText(submission: ContactSubmission): string {
  return [
    'New contact message from chriszombik.com',
    '',
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    '',
    'Message:',
    submission.message,
  ].join('\n');
}

export function redactEmailForLog(email: string): string {
  const [localPart, domainPart] = email.split('@');
  if (!localPart || !domainPart) {
    return 'redacted';
  }

  if (localPart.length <= 2) {
    return `**@${domainPart}`;
  }

  return `${localPart.slice(0, 2)}***@${domainPart}`;
}
