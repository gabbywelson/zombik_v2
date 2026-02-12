import type { APIContext } from 'astro';
import { Resend } from 'resend';
import { createContactStore } from '../../lib/contact-store';
import {
  extractRemoteIp,
  formatContactEmailText,
  isHoneypotTriggered,
  parseContactSubmission,
  redactEmailForLog,
  type ContactStatus,
  type ContactSubmission,
  validateContactSubmission,
  verifyTurnstileToken,
} from '../../lib/contact';

export const prerender = false;

const CONTACT_ROUTE = '/contact';
const CONTACT_SUCCESS_ROUTE = '/contact/thank-you';
const DEFAULT_SUBJECT_PREFIX = '[chriszombik.com]';

type ContactFailureStatus = Exclude<ContactStatus, 'success'>;

interface ContactRuntimeConfig {
  resendApiKey: string;
  contactToEmail: string;
  contactFromEmail: string;
  contactSubjectPrefix: string;
  turnstileSecretKey: string;
  contactSanityProjectId: string;
  contactSanityDataset: string;
  contactSanityApiVersion: string;
  contactSanityWriteToken: string;
}

interface ContactHandlerDependencies {
  verifyCaptcha: (token: string, remoteIp?: string) => Promise<boolean>;
  sendEmail: (submission: ContactSubmission) => Promise<void>;
  createQueuedSubmission: (input: {
    submission: ContactSubmission;
    remoteIp?: string;
    metadata?: { userAgent?: string };
  }) => Promise<{ id: string }>;
  markSubmissionSent: (id: string) => Promise<void>;
  markSubmissionFailed: (id: string, reason: unknown) => Promise<void>;
  logError: (message: string, details?: Record<string, unknown>) => void;
}

function methodNotAllowedResponse(): Response {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      Allow: 'POST',
    },
  });
}

function redirectToContact(status: ContactFailureStatus): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: `${CONTACT_ROUTE}?status=${status}`,
    },
  });
}

function redirectToThankYou(): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: CONTACT_SUCCESS_ROUTE,
    },
  });
}

function getEnvValue(key: string): string {
  const env = import.meta.env as Record<string, unknown>;
  const value = env[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getRuntimeConfig(): ContactRuntimeConfig {
  const contactSanityProjectId =
    getEnvValue('CONTACT_SANITY_PROJECT_ID') || getEnvValue('PUBLIC_SANITY_PROJECT_ID');
  const contactSanityDataset =
    getEnvValue('CONTACT_SANITY_DATASET') || getEnvValue('PUBLIC_SANITY_DATASET');
  const contactSanityApiVersion =
    getEnvValue('CONTACT_SANITY_API_VERSION') ||
    getEnvValue('PUBLIC_SANITY_API_VERSION') ||
    '2025-01-01';

  return {
    resendApiKey: getEnvValue('RESEND_API_KEY'),
    contactToEmail: getEnvValue('CONTACT_TO_EMAIL'),
    contactFromEmail: getEnvValue('CONTACT_FROM_EMAIL'),
    contactSubjectPrefix: getEnvValue('CONTACT_SUBJECT_PREFIX') || DEFAULT_SUBJECT_PREFIX,
    turnstileSecretKey: getEnvValue('TURNSTILE_SECRET_KEY'),
    contactSanityProjectId,
    contactSanityDataset,
    contactSanityApiVersion,
    contactSanityWriteToken: getEnvValue('CONTACT_SANITY_WRITE_TOKEN'),
  };
}

function createDefaultDependencies(
  config: ContactRuntimeConfig,
): ContactHandlerDependencies {
  const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;
  const canCreateStore =
    Boolean(config.contactSanityProjectId) &&
    Boolean(config.contactSanityDataset) &&
    Boolean(config.contactSanityWriteToken);
  const store = canCreateStore
    ? createContactStore({
        projectId: config.contactSanityProjectId,
        dataset: config.contactSanityDataset,
        apiVersion: config.contactSanityApiVersion,
        writeToken: config.contactSanityWriteToken,
      })
    : null;

  return {
    verifyCaptcha: (token: string, remoteIp?: string) => {
      return verifyTurnstileToken({
        token,
        remoteIp,
        secretKey: config.turnstileSecretKey,
      });
    },
    sendEmail: async (submission: ContactSubmission) => {
      if (!resend) {
        throw new Error('Resend is not configured.');
      }

      await resend.emails.send({
        from: config.contactFromEmail,
        to: config.contactToEmail,
        replyTo: submission.email,
        subject: `${config.contactSubjectPrefix} New contact form message`,
        text: formatContactEmailText(submission),
      });
    },
    createQueuedSubmission: (input) => {
      if (!store) {
        throw new Error('Contact store is not configured.');
      }

      return store.createQueuedSubmission(input);
    },
    markSubmissionSent: (id) => {
      if (!store) {
        throw new Error('Contact store is not configured.');
      }

      return store.markSubmissionSent(id);
    },
    markSubmissionFailed: (id, reason) => {
      if (!store) {
        throw new Error('Contact store is not configured.');
      }

      return store.markSubmissionFailed(id, reason);
    },
    logError: (message: string, details?: Record<string, unknown>) => {
      console.error(message, details);
    },
  };
}

export function createContactPostHandler(
  deps: ContactHandlerDependencies,
  config: ContactRuntimeConfig,
) {
  return async function handleContactPost(
    request: Request,
    clientAddress?: string,
  ): Promise<Response> {
    if (
      !config.resendApiKey ||
      !config.contactToEmail ||
      !config.contactFromEmail ||
      !config.turnstileSecretKey ||
      !config.contactSanityProjectId ||
      !config.contactSanityDataset ||
      !config.contactSanityWriteToken
    ) {
      deps.logError('Contact form configuration is incomplete.');
      return redirectToContact('error');
    }

    let submission: ReturnType<typeof parseContactSubmission>;

    try {
      const formData = await request.formData();
      submission = parseContactSubmission(formData);
    } catch (error) {
      deps.logError('Failed to parse contact form payload.', {
        error: error instanceof Error ? error.message : String(error),
      });
      return redirectToContact('invalid');
    }

    if (isHoneypotTriggered(submission.company)) {
      return redirectToThankYou();
    }

    const validation = validateContactSubmission(submission);
    if (!validation.ok || !validation.data) {
      return redirectToContact('invalid');
    }

    const remoteIp = extractRemoteIp(request, clientAddress);
    const captchaValid = await deps.verifyCaptcha(
      validation.data.captchaToken,
      remoteIp,
    );

    if (!captchaValid) {
      deps.logError('CAPTCHA verification failed for contact form submission.', {
        email: redactEmailForLog(validation.data.email),
      });
      return redirectToContact('captcha');
    }

    let storedSubmissionId: string;
    try {
      const created = await deps.createQueuedSubmission({
        submission: validation.data,
        remoteIp,
        metadata: {
          userAgent: request.headers.get('user-agent') ?? undefined,
        },
      });
      storedSubmissionId = created.id;
    } catch (error) {
      deps.logError('Failed to persist contact submission in Sanity.', {
        error: error instanceof Error ? error.message : String(error),
        email: redactEmailForLog(validation.data.email),
      });
      return redirectToContact('error');
    }

    try {
      await deps.sendEmail(validation.data);
    } catch (error) {
      try {
        await deps.markSubmissionFailed(storedSubmissionId, error);
      } catch (patchError) {
        deps.logError('Failed to mark contact submission as failed in Sanity.', {
          error: patchError instanceof Error ? patchError.message : String(patchError),
          email: redactEmailForLog(validation.data.email),
        });
      }

      deps.logError('Failed to send contact form email.', {
        error: error instanceof Error ? error.message : String(error),
        email: redactEmailForLog(validation.data.email),
        nameLength: validation.data.name.length,
      });
      return redirectToContact('error');
    }

    try {
      await deps.markSubmissionSent(storedSubmissionId);
    } catch (error) {
      deps.logError('Failed to mark contact submission as sent in Sanity.', {
        error: error instanceof Error ? error.message : String(error),
        email: redactEmailForLog(validation.data.email),
      });
    }

    return redirectToThankYou();
  };
}

const runtimeConfig = getRuntimeConfig();
const runtimeDeps = createDefaultDependencies(runtimeConfig);
const handleContactPost = createContactPostHandler(runtimeDeps, runtimeConfig);

export async function POST(context: APIContext): Promise<Response> {
  return handleContactPost(context.request, context.clientAddress);
}

export function GET(): Response {
  return methodNotAllowedResponse();
}

export function ALL(): Response {
  return methodNotAllowedResponse();
}
