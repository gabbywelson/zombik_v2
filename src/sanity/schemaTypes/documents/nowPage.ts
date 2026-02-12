import { defineField, defineType } from 'sanity';
import { richTextContent } from '../../portableText/richTextFields';

export const nowPageType = defineType({
  name: 'nowPage',
  title: 'Now Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Now',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: richTextContent,
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'lastUpdated',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Now',
        subtitle: selection.subtitle
          ? `Updated ${selection.subtitle}`
          : 'No update date',
      };
    },
  },
});
