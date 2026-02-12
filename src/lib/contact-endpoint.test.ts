import { describe, expect, test } from 'bun:test';
import { GET, createContactPostHandler } from '../pages/api/contact';

function buildBaseFormData(): FormData {
  const formData = new FormData();
  formData.set('name', 'Chris Zombik');
  formData.set('email', 'chris@example.com');
  formData.set('message', 'Hello there, this message is long enough to be valid.');
  formData.set('company', '');
  formData.set('cf-turnstile-response', 'captcha-token');
  return formData;
}

function buildPostRequest(formData: FormData): Request {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    body: formData,
  });
}

const config = {
  resendApiKey: 'test-key',
  contactToEmail: 'to@example.com',
  contactFromEmail: 'from@example.com',
  contactSubjectPrefix: '[test]',
  turnstileSecretKey: 'turnstile-secret',
  contactSanityProjectId: 'project-id',
  contactSanityDataset: 'production',
  contactSanityApiVersion: '2025-01-01',
  contactSanityWriteToken: 'write-token',
};

describe('/api/contact', () => {
  test('creates queued submission, sends email, then marks sent', async () => {
    let verifyCalls = 0;
    let sendCalls = 0;
    let createCalls = 0;
    let markSentCalls = 0;
    let markFailedCalls = 0;

    const handler = createContactPostHandler(
      {
        verifyCaptcha: async () => {
          verifyCalls += 1;
          return true;
        },
        sendEmail: async () => {
          sendCalls += 1;
        },
        createQueuedSubmission: async () => {
          createCalls += 1;
          return { id: 'contactSubmission.test' };
        },
        markSubmissionSent: async () => {
          markSentCalls += 1;
        },
        markSubmissionFailed: async () => {
          markFailedCalls += 1;
        },
        logError: () => {},
      },
      config,
    );

    const response = await handler(buildPostRequest(buildBaseFormData()));

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/contact/thank-you');
    expect(verifyCalls).toBe(1);
    expect(createCalls).toBe(1);
    expect(sendCalls).toBe(1);
    expect(markSentCalls).toBe(1);
    expect(markFailedCalls).toBe(0);
  });

  test('creates queued submission and marks failed when email send fails', async () => {
    let sendCalls = 0;
    let markFailedCalls = 0;

    const handler = createContactPostHandler(
      {
        verifyCaptcha: async () => true,
        sendEmail: async () => {
          sendCalls += 1;
          throw new Error('Simulated send failure');
        },
        createQueuedSubmission: async () => ({ id: 'contactSubmission.test' }),
        markSubmissionSent: async () => {},
        markSubmissionFailed: async () => {
          markFailedCalls += 1;
        },
        logError: () => {},
      },
      config,
    );

    const response = await handler(buildPostRequest(buildBaseFormData()));

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/contact?status=error');
    expect(sendCalls).toBe(1);
    expect(markFailedCalls).toBe(1);
  });

  test('blocks submission when captcha verification fails', async () => {
    let sendCalls = 0;
    let createCalls = 0;

    const handler = createContactPostHandler(
      {
        verifyCaptcha: async () => false,
        sendEmail: async () => {
          sendCalls += 1;
        },
        createQueuedSubmission: async () => {
          createCalls += 1;
          return { id: 'contactSubmission.test' };
        },
        markSubmissionSent: async () => {},
        markSubmissionFailed: async () => {},
        logError: () => {},
      },
      config,
    );

    const response = await handler(buildPostRequest(buildBaseFormData()));

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/contact?status=captcha');
    expect(createCalls).toBe(0);
    expect(sendCalls).toBe(0);
  });

  test('fails closed when queued submission cannot be persisted', async () => {
    let sendCalls = 0;

    const handler = createContactPostHandler(
      {
        verifyCaptcha: async () => true,
        sendEmail: async () => {
          sendCalls += 1;
        },
        createQueuedSubmission: async () => {
          throw new Error('Sanity unavailable');
        },
        markSubmissionSent: async () => {},
        markSubmissionFailed: async () => {},
        logError: () => {},
      },
      config,
    );

    const response = await handler(buildPostRequest(buildBaseFormData()));

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/contact?status=error');
    expect(sendCalls).toBe(0);
  });

  test('treats honeypot submissions as neutral success without side effects', async () => {
    let verifyCalls = 0;
    let sendCalls = 0;
    let createCalls = 0;
    const formData = buildBaseFormData();
    formData.set('company', 'Acme Corp');

    const handler = createContactPostHandler(
      {
        verifyCaptcha: async () => {
          verifyCalls += 1;
          return true;
        },
        sendEmail: async () => {
          sendCalls += 1;
        },
        createQueuedSubmission: async () => {
          createCalls += 1;
          return { id: 'contactSubmission.test' };
        },
        markSubmissionSent: async () => {},
        markSubmissionFailed: async () => {},
        logError: () => {},
      },
      config,
    );

    const response = await handler(buildPostRequest(formData));

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/contact/thank-you');
    expect(verifyCalls).toBe(0);
    expect(createCalls).toBe(0);
    expect(sendCalls).toBe(0);
  });

  test('returns method-not-allowed for non-POST requests', () => {
    const response = GET();

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });

  test('returns error when runtime configuration is incomplete', async () => {
    let verifyCalls = 0;
    let sendCalls = 0;
    let createCalls = 0;

    const handler = createContactPostHandler(
      {
        verifyCaptcha: async () => {
          verifyCalls += 1;
          return true;
        },
        sendEmail: async () => {
          sendCalls += 1;
        },
        createQueuedSubmission: async () => {
          createCalls += 1;
          return { id: 'contactSubmission.test' };
        },
        markSubmissionSent: async () => {},
        markSubmissionFailed: async () => {},
        logError: () => {},
      },
      {
        ...config,
        turnstileSecretKey: '',
      },
    );

    const response = await handler(buildPostRequest(buildBaseFormData()));

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/contact?status=error');
    expect(verifyCalls).toBe(0);
    expect(createCalls).toBe(0);
    expect(sendCalls).toBe(0);
  });
});
