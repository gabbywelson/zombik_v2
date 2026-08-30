/**
 * Prints the encoded form of an email address for src/lib/contact-email.ts.
 *
 * Usage:
 *   bun run contact-email someone@example.com
 */
import { decodeEmail, encodeEmail } from '../src/lib/contact-email';

const input = process.argv[2];

if (!input) {
  console.error('Usage: bun run contact-email someone@example.com');
  process.exit(1);
}

const encoded = encodeEmail(input);

if (decodeEmail(encoded) !== input.trim()) {
  console.error('Internal error: encoded address did not round-trip.');
  process.exit(1);
}

console.log('Paste this into CONTACT_EMAIL in src/lib/contact-email.ts:\n');
console.log('export const CONTACT_EMAIL: EncodedEmail = {');
console.log(`  user: ${JSON.stringify(encoded.user)},`);
console.log(`  domain: ${JSON.stringify(encoded.domain)},`);
console.log('};');
