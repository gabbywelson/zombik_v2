/**
 * FORMATTING HELPERS.
 *
 * formatDate turns an ISO date like "2026-08-01T16:00:00.000Z" (or a plain
 * "2026-08-01") into the human-friendly "August 1, 2026" shown on posts.
 *
 * Dates are always formatted in UTC so the result is the same whether the site
 * is built on a laptop in Massachusetts or on GitHub's servers. Without this, a
 * date like "2026-02-02" would show as February 1 when previewed locally in a
 * US time zone.
 *
 * To change the date style site-wide (e.g. "1 Aug 2026"), change the options here.
 */
export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
