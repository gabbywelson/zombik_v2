import { describe, expect, test } from 'bun:test';
import type { PortableTextBlock } from './sanity.types';
import { collectFootnotes } from './footnotes';

function blockWithFootnotes(): PortableTextBlock[] {
  return [
    {
      _type: 'block',
      _key: 'block-1',
      style: 'normal',
      markDefs: [
        {
          _type: 'footnote',
          _key: 'fn-1',
          note: [
            {
              _type: 'block',
              _key: 'note-1',
              style: 'normal',
              markDefs: [],
              children: [
                {
                  _type: 'span',
                  _key: 'note-1-span',
                  text: 'First note',
                  marks: [],
                },
              ],
            },
          ],
        },
        {
          _type: 'footnote',
          _key: 'fn-2',
          note: [
            {
              _type: 'block',
              _key: 'note-2',
              style: 'normal',
              markDefs: [],
              children: [
                {
                  _type: 'span',
                  _key: 'note-2-span',
                  text: 'Second note',
                  marks: [],
                },
              ],
            },
          ],
        },
      ],
      children: [
        {
          _type: 'span',
          _key: 'span-1',
          text: 'One',
          marks: ['fn-1'],
        },
        {
          _type: 'span',
          _key: 'span-2',
          text: 'Two',
          marks: ['fn-2'],
        },
      ],
    },
  ];
}

describe('collectFootnotes', () => {
  test('maps a single footnote', () => {
    const [firstBlock] = blockWithFootnotes();
    const blocks: PortableTextBlock[] = [
      {
        ...firstBlock,
        markDefs: firstBlock.markDefs?.slice(0, 1),
        children: firstBlock.children.slice(0, 1),
      },
    ];
    const result = collectFootnotes(blocks, 'post-1');

    expect(result.items.length).toBe(1);
    expect(result.items[0]?.number).toBe(1);
    expect(result.items[0]?.noteId).toBe('post-1-note-1');
  });

  test('preserves reading order across multiple marks', () => {
    const blocks = blockWithFootnotes();
    const result = collectFootnotes(blocks, 'reading-order');

    expect(result.items.map((item) => item.key)).toEqual(['fn-1', 'fn-2']);
    expect(result.items.map((item) => item.number)).toEqual([1, 2]);
  });

  test('does not duplicate endnote rows for repeated annotation keys', () => {
    const repeatedBlocks: PortableTextBlock[] = [
      {
        _type: 'block',
        _key: 'block-repeat',
        style: 'normal',
        markDefs: [
          {
            _type: 'footnote',
            _key: 'fn-repeat',
            note: [
              {
                _type: 'block',
                _key: 'repeat-note',
                style: 'normal',
                markDefs: [],
                children: [
                  {
                    _type: 'span',
                    _key: 'repeat-note-span',
                    text: 'Repeated footnote',
                    marks: [],
                  },
                ],
              },
            ],
          },
        ],
        children: [
          {
            _type: 'span',
            _key: 'repeat-span-1',
            text: 'First mention',
            marks: ['fn-repeat'],
          },
          {
            _type: 'span',
            _key: 'repeat-span-2',
            text: 'Second mention',
            marks: ['fn-repeat'],
          },
        ],
      },
    ];

    const result = collectFootnotes(repeatedBlocks, 'repeat');

    expect(result.items.length).toBe(1);
    expect(result.items[0]?.key).toBe('fn-repeat');
  });
});
