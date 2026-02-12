import { defineArrayMember, defineField, defineType } from 'sanity';

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default social image',
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
    }),
    defineField({
      name: 'navItems',
      title: 'Navigation items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navItem',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: 'href',
              title: 'Href',
              type: 'string',
              validation: (rule) => rule.required().max(120),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'href',
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site settings',
      };
    },
  },
});
