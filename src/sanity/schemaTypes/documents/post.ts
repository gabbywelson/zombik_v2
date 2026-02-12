import { defineArrayMember, defineField, defineType } from 'sanity';
import { richTextContent } from '../../portableText/richTextFields';

const contentKinds = [
  { title: 'Blog', value: 'blog' },
  { title: 'Short Story', value: 'short-story' },
  { title: 'Essay', value: 'essay' },
];

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().min(5).max(160),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.max(200),
        }),
      ],
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) {
            return true;
          }

          const alt = typeof value.alt === 'string' ? value.alt.trim() : '';
          return alt.length > 0 ? true : 'Alt text is required when a hero image is present';
        }),
    }),
    defineField({
      name: 'contentKind',
      title: 'Content kind',
      type: 'string',
      initialValue: 'blog',
      options: {
        list: contentKinds,
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'tag' }],
        }),
      ],
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
      date: 'publishedAt',
      subtitle: 'contentKind',
      media: 'heroImage',
    },
    prepare(selection) {
      const date = selection.date
        ? new Date(selection.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'No date';

      return {
        title: selection.title,
        subtitle: `${selection.subtitle ?? 'post'} • ${date}`,
        media: selection.media,
      };
    },
  },
});
