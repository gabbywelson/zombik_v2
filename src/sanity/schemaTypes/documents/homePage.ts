import { defineArrayMember, defineField, defineType } from 'sanity';
import { richTextContent } from '../../portableText/richTextFields';

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroHeading',
      title: 'Hero heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero subheading',
      type: 'string',
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'array',
      of: richTextContent,
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'novelCardCopy',
      title: 'The Novel copy',
      description: 'Homepage card copy for "The Novel".',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required().max(480),
    }),
    defineField({
      name: 'memoirCardCopy',
      title: 'The memoir copy',
      description: 'Homepage card copy for "The memoir".',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required().max(480),
    }),
    defineField({
      name: 'featuredPosts',
      title: 'Featured posts',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'post' }],
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home page',
      };
    },
  },
});
