import type { ContentKind } from './sanity.types';

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function contentKindLabel(kind: ContentKind): string {
  switch (kind) {
    case 'short-story':
      return 'Short Story';
    case 'essay':
      return 'Essay';
    case 'blog':
    default:
      return 'Blog';
  }
}
