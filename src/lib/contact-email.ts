/**
 * Contact email obfuscation.
 *
 * The contact page never contains the plain email address in its HTML (and the
 * address is never written in plain text anywhere in this public repository).
 * Instead the address is stored ROT13/ROT5-encoded and decoded in the visitor's
 * browser, which defeats the simple scrapers that harvest addresses from page
 * source. Visitors without JavaScript see a human-readable hint instead.
 *
 * To change the address, run:
 *
 *   bun run contact-email someone@example.com
 *
 * and paste the printed value into CONTACT_EMAIL below.
 */

export interface EncodedEmail {
  /** Encoded part before the "@". */
  user: string;
  /** Encoded part after the "@", including the dot(s). */
  domain: string;
}

/** The site's contact address, encoded. Regenerate with `bun run contact-email`. */
export const CONTACT_EMAIL: EncodedEmail = {
  user: 'pmbzovx',
  domain: 'tznvy.pbz',
};

/**
 * Rotates letters by 13 and digits by 5. The transform is its own inverse, so
 * the same function both encodes and decodes.
 */
export function rotate(input: string): string {
  return input.replace(/[a-zA-Z0-9]/g, (ch) => {
    const code = ch.charCodeAt(0);
    if (ch >= '0' && ch <= '9') {
      return String.fromCharCode(((code - 48 + 5) % 10) + 48);
    }
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

export function encodeEmail(email: string): EncodedEmail {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf('@');
  if (at <= 0 || at === trimmed.length - 1) {
    throw new Error(`Not an email address: "${email}"`);
  }
  return {
    user: rotate(trimmed.slice(0, at)),
    domain: rotate(trimmed.slice(at + 1)),
  };
}

export function decodeEmail(encoded: EncodedEmail): string {
  return `${rotate(encoded.user)}@${rotate(encoded.domain)}`;
}
