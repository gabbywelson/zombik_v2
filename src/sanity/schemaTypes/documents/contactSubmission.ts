import { defineField, defineType } from 'sanity';

const deliveryStatuses = [
  { title: 'Queued', value: 'queued' },
  { title: 'Sent', value: 'sent' },
  { title: 'Failed', value: 'failed' },
] as const;

export const contactSubmissionType = defineType({
  name: 'contactSubmission',
  title: 'Contact Submission',
  type: 'document',
  orderings: [
    {
      title: 'Received (newest)',
      name: 'receivedAtDesc',
      by: [{ field: 'receivedAt', direction: 'desc' }],
    },
    {
      title: 'Received (oldest)',
      name: 'receivedAtAsc',
      by: [{ field: 'receivedAt', direction: 'asc' }],
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 8,
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'receivedAt',
      title: 'Received at',
      type: 'datetime',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'deliveryStatus',
      title: 'Delivery status',
      type: 'string',
      readOnly: true,
      options: {
        list: deliveryStatuses.map((status) => ({
          title: status.title,
          value: status.value,
        })),
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'deliveryAttempts',
      title: 'Delivery attempts',
      type: 'number',
      readOnly: true,
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'deliveryProvider',
      title: 'Delivery provider',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'deliveryError',
      title: 'Delivery error',
      type: 'text',
      rows: 4,
      readOnly: true,
    }),
    defineField({
      name: 'captchaPassed',
      title: 'CAPTCHA passed',
      type: 'boolean',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'remoteIpHash',
      title: 'Remote IP hash',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      readOnly: true,
      fields: [
        defineField({
          name: 'userAgent',
          title: 'User agent',
          type: 'string',
          readOnly: true,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      status: 'deliveryStatus',
      receivedAt: 'receivedAt',
    },
    prepare(selection) {
      const date = selection.receivedAt
        ? new Date(selection.receivedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'No timestamp';

      return {
        title: selection.title || 'Contact submission',
        subtitle: `${selection.status ?? 'queued'} • ${date}`,
      };
    },
  },
});
