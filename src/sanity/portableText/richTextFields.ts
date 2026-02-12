import { defineArrayMember, defineField } from 'sanity';

function linkAnnotation() {
  return defineArrayMember({
    type: 'object',
    name: 'link',
    title: 'Link',
    fields: [
      defineField({
        name: 'href',
        title: 'URL',
        type: 'url',
        validation: (rule) =>
          rule
            .required()
            .uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
      }),
      defineField({
        name: 'blank',
        title: 'Open in new tab',
        type: 'boolean',
        initialValue: true,
      }),
    ],
  });
}

const footnoteNoteBlock = defineArrayMember({
  type: 'block',
  styles: [{ title: 'Normal', value: 'normal' }],
  lists: [],
  marks: {
    decorators: [
      { title: 'Strong', value: 'strong' },
      { title: 'Emphasis', value: 'em' },
      { title: 'Code', value: 'code' },
    ],
    annotations: [linkAnnotation()],
  },
});

function footnoteAnnotation() {
  return defineArrayMember({
    type: 'object',
    name: 'footnote',
    title: 'Footnote',
    fields: [
      defineField({
        name: 'note',
        title: 'Note',
        type: 'array',
        of: [footnoteNoteBlock],
        validation: (rule) => rule.required().min(1),
      }),
    ],
    preview: {
      prepare() {
        return {
          title: 'Footnote',
        };
      },
    },
  });
}

const richTextBlock = defineArrayMember({
  type: 'block',
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'Heading 2', value: 'h2' },
    { title: 'Heading 3', value: 'h3' },
    { title: 'Blockquote', value: 'blockquote' },
    { title: 'Indented', value: 'indent' },
  ],
  lists: [
    { title: 'Bullet', value: 'bullet' },
    { title: 'Numbered', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Strong', value: 'strong' },
      { title: 'Emphasis', value: 'em' },
      { title: 'Code', value: 'code' },
    ],
    annotations: [linkAnnotation(), footnoteAnnotation()],
  },
});

export const richTextContent = [richTextBlock];
export const footnoteRichTextContent = [footnoteNoteBlock];
