import { createHash, randomUUID } from 'node:crypto';
import { createClient, type SanityClient } from '@sanity/client';
import type { ContactSubmission } from './contact';

export type ContactDeliveryStatus = 'queued' | 'sent' | 'failed';

const CONTACT_SOURCE = 'contact-form';
const DELIVERY_PROVIDER = 'resend';
const DELIVERY_ERROR_MAX_LENGTH = 500;
const USER_AGENT_MAX_LENGTH = 300;

interface ContactStoreConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  writeToken: string;
}

interface ContactSubmissionMetadata {
  userAgent?: string;
}

interface CreateQueuedSubmissionInput {
  submission: ContactSubmission;
  remoteIp?: string;
  metadata?: ContactSubmissionMetadata;
}

interface CreateQueuedSubmissionResult {
  id: string;
}

interface ContactSubmissionDocument {
  _id: string;
  _type: 'contactSubmission';
  name: string;
  email: string;
  message: string;
  receivedAt: string;
  source: string;
  deliveryStatus: ContactDeliveryStatus;
  deliveryAttempts: number;
  deliveryProvider: string;
  captchaPassed: boolean;
  remoteIpHash?: string;
  metadata?: ContactSubmissionMetadata;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength);
}

export function hashRemoteIp(remoteIp?: string): string | undefined {
  const normalizedIp = remoteIp?.trim();
  if (!normalizedIp) {
    return undefined;
  }

  return createHash('sha256').update(normalizedIp).digest('hex');
}

export function sanitizeDeliveryError(error: unknown): string {
  const raw =
    error instanceof Error ? error.message : typeof error === 'string' ? error : String(error);
  return truncate(raw.replace(/\s+/g, ' ').trim(), DELIVERY_ERROR_MAX_LENGTH);
}

export function buildContactSubmissionDocument(
  input: CreateQueuedSubmissionInput,
  options: {
    id?: string;
    now?: Date;
  } = {},
): ContactSubmissionDocument {
  const id = options.id || `contactSubmission.${randomUUID()}`;
  const now = options.now ?? new Date();
  const userAgent = input.metadata?.userAgent?.trim();

  const document: ContactSubmissionDocument = {
    _id: id,
    _type: 'contactSubmission',
    name: input.submission.name,
    email: input.submission.email,
    message: input.submission.message,
    receivedAt: now.toISOString(),
    source: CONTACT_SOURCE,
    deliveryStatus: 'queued',
    deliveryAttempts: 1,
    deliveryProvider: DELIVERY_PROVIDER,
    captchaPassed: true,
  };

  const remoteIpHash = hashRemoteIp(input.remoteIp);
  if (remoteIpHash) {
    document.remoteIpHash = remoteIpHash;
  }

  if (userAgent) {
    document.metadata = {
      userAgent: truncate(userAgent, USER_AGENT_MAX_LENGTH),
    };
  }

  return document;
}

export interface ContactStore {
  createQueuedSubmission(input: CreateQueuedSubmissionInput): Promise<CreateQueuedSubmissionResult>;
  markSubmissionSent(id: string): Promise<void>;
  markSubmissionFailed(id: string, reason: unknown): Promise<void>;
}

function createWriteClient(config: ContactStoreConfig): SanityClient {
  return createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token: config.writeToken,
    useCdn: false,
  });
}

export function createContactStore(config: ContactStoreConfig): ContactStore {
  const client = createWriteClient(config);

  return {
    async createQueuedSubmission(input: CreateQueuedSubmissionInput) {
      const document = buildContactSubmissionDocument(input);
      await client.create(document);
      return { id: document._id };
    },
    async markSubmissionSent(id: string) {
      await client.patch(id).set({ deliveryStatus: 'sent' }).unset(['deliveryError']).commit();
    },
    async markSubmissionFailed(id: string, reason: unknown) {
      await client
        .patch(id)
        .set({
          deliveryStatus: 'failed',
          deliveryError: sanitizeDeliveryError(reason),
        })
        .commit();
    },
  };
}
