import { createDecoratorGuard } from '@portabletext/plugin-typography';
import type { PortableTextPluginsProps } from 'sanity';
import { createMarkdownBehaviors, createTypographicBehaviors } from './behaviors';

const markdownConfig = createMarkdownBehaviors();
const typographyConfig = createTypographicBehaviors();

export function PortableTextPlugins(props: PortableTextPluginsProps) {
  return props.renderDefault({
    ...props,
    plugins: {
      ...props.plugins,
      markdown: {
        config: markdownConfig,
      },
      typography: {
        ...props.plugins.typography,
        ...typographyConfig,
        enabled: true,
        guard: createDecoratorGuard({
          decorators: ({ context }) =>
            context.schema.decorators.flatMap((decorator) =>
              decorator.name === 'code' ? [] : [decorator.name],
            ),
        }),
      },
    },
  });
}
