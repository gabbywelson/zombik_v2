import type { MarkdownShortcutsPluginProps } from '@portabletext/plugin-markdown-shortcuts';
import type { TypographyPluginProps } from '@portabletext/plugin-typography';

export function createMarkdownBehaviors(): MarkdownShortcutsPluginProps {
  return {
    boldDecorator: ({ context }) =>
      context.schema.decorators.find((decorator) => decorator.name === 'strong')?.name,
    codeDecorator: ({ context }) =>
      context.schema.decorators.find((decorator) => decorator.name === 'code')?.name,
    italicDecorator: ({ context }) =>
      context.schema.decorators.find((decorator) => decorator.name === 'em')?.name,
    defaultStyle: ({ context }) =>
      context.schema.styles.find((style) => style.name === 'normal')?.name,
    blockquoteStyle: ({ context }) =>
      context.schema.styles.find((style) => style.name === 'blockquote')?.name,
    headingStyle: ({ context, props }) =>
      context.schema.styles.find((style) => style.name === `h${props.level}`)?.name,
    orderedList: ({ context }) =>
      context.schema.lists.find((list) => list.name === 'number')?.name,
    unorderedList: ({ context }) =>
      context.schema.lists.find((list) => list.name === 'bullet')?.name,
  };
}

export function createTypographicBehaviors(): Pick<TypographyPluginProps, 'preset'> {
  return {
    preset: 'default',
  };
}
