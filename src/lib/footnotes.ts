import type { FootnoteItem, FootnoteMarkDefinition, PortableTextBlock } from './sanity.types';

function normalizePrefix(prefix: string): string {
  const safe = prefix.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  return safe.length > 0 ? safe : 'footnote';
}

function isPortableTextBlock(value: unknown): value is PortableTextBlock {
  return Boolean(
    value &&
      typeof value === 'object' &&
      '_type' in value &&
      (value as { _type?: string })._type === 'block',
  );
}

function isFootnoteMarkDefinition(value: unknown): value is FootnoteMarkDefinition {
  return Boolean(
    value &&
      typeof value === 'object' &&
      '_type' in value &&
      (value as { _type?: string })._type === 'footnote' &&
      '_key' in value &&
      'note' in value,
  );
}

export function collectFootnotes(
  blocks: PortableTextBlock[] | undefined,
  idPrefix = 'footnote',
): {
  items: FootnoteItem[];
  byMarkKey: Record<string, FootnoteItem>;
} {
  if (!blocks || blocks.length === 0) {
    return { items: [], byMarkKey: {} };
  }

  const prefix = normalizePrefix(idPrefix);
  const items: FootnoteItem[] = [];
  const byMarkKey: Record<string, FootnoteItem> = {};

  for (const block of blocks) {
    if (!isPortableTextBlock(block) || block._type !== 'block') {
      continue;
    }

    const definitions = new Map<string, FootnoteMarkDefinition>();

    for (const markDef of block.markDefs ?? []) {
      if (isFootnoteMarkDefinition(markDef) && Array.isArray(markDef.note)) {
        definitions.set(markDef._key, markDef);
      }
    }

    if (definitions.size === 0) {
      continue;
    }

    for (const child of block.children ?? []) {
      const marks = Array.isArray((child as { marks?: string[] }).marks)
        ? ((child as { marks: string[] }).marks ?? [])
        : [];

      for (const markKey of marks) {
        if (byMarkKey[markKey]) {
          continue;
        }

        const definition = definitions.get(markKey);
        if (!definition) {
          continue;
        }

        const noteBlocks = definition.note.filter(isPortableTextBlock);
        if (noteBlocks.length === 0) {
          continue;
        }

        const number = items.length + 1;
        const item: FootnoteItem = {
          key: markKey,
          number,
          refId: `${prefix}-ref-${number}`,
          noteId: `${prefix}-note-${number}`,
          note: noteBlocks,
        };

        byMarkKey[markKey] = item;
        items.push(item);
      }
    }
  }

  return { items, byMarkKey };
}
