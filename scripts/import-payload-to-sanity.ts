#!/usr/bin/env bun

import { createClient, type SanityClient } from '@sanity/client';
import { createHash } from 'node:crypto';
import process from 'node:process';

interface ImportOptions {
  dryRun: boolean;
  includeDrafts: boolean;
  skipImages: boolean;
  verbose: boolean;
}

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
}

interface PayloadMedia {
  id?: number | string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  alt?: string | null;
}

interface PayloadCategory {
  id: number | string;
  title?: string | null;
  slug?: string | null;
}

interface PayloadAuthor {
  id: number | string;
  name?: string | null;
}

interface PayloadPost {
  id: number | string;
  title?: string | null;
  slug?: string | null;
  content?: unknown;
  heroImage?: PayloadMedia | null;
  categories?: Array<number | string | PayloadCategory>;
  populatedAuthors?: PayloadAuthor[];
  publishedAt?: string | null;
  updatedAt?: string | null;
  meta?: {
    description?: string | null;
  } | null;
  _status?: string;
}

interface PayloadPage {
  id: number | string;
  title?: string | null;
  slug?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  hero?: {
    richText?: unknown;
    authorBio?: unknown;
    authorImage?: PayloadMedia | null;
  } | null;
  layout?: Array<{
    blockType?: string;
    heading?: string | null;
    description?: string | null;
    columns?: Array<{
      richText?: unknown;
    }>;
  }>;
  meta?: {
    title?: string | null;
    description?: string | null;
  } | null;
  _status?: string;
}

interface PayloadHeaderGlobal {
  navItems?: Array<{
    link?: {
      type?: 'custom' | 'reference' | string;
      label?: string | null;
      url?: string | null;
      reference?: {
        relationTo?: string;
        value?: {
          slug?: string | null;
        };
      } | null;
    };
  }>;
}

interface PayloadFooterGlobal {
  socialLinks?: Array<{
    platform?: string | null;
    url?: string | null;
  }>;
}

interface PortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

interface PortableTextMarkDef {
  _key: string;
  _type: 'link';
  href: string;
  blank: boolean;
}

interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style: 'normal' | 'h2' | 'h3' | 'blockquote' | 'indent';
  children: PortableTextSpan[];
  markDefs: PortableTextMarkDef[];
  listItem?: 'bullet' | 'number';
  level?: number;
}

interface SanityImageField {
  _type: 'image';
  asset: {
    _type: 'reference';
    _ref: string;
  };
  alt: string;
}

interface ImportSummary {
  tags: number;
  authors: number;
  posts: number;
  homePage: number;
  aboutPage: number;
  nowPage: number;
  siteSettings: number;
  imagesUploaded: number;
}

function parseArgs(argv: string[]): ImportOptions {
  const flags = new Set(argv);

  return {
    dryRun: flags.has('--dry-run'),
    includeDrafts: flags.has('--include-drafts'),
    skipImages: flags.has('--skip-images'),
    verbose: flags.has('--verbose'),
  };
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeBaseUrl(input: string): string {
  return input.replace(/\/+$/, '');
}

function toAbsoluteUrl(baseUrl: string, maybeRelativeUrl: string): string {
  return new URL(maybeRelativeUrl, `${normalizeBaseUrl(baseUrl)}/`).toString();
}

function hashKey(input: string): string {
  return createHash('sha1').update(input).digest('hex').slice(0, 12);
}

function makeKey(scope: string, value: string): string {
  return `${scope}-${hashKey(value)}`;
}

function sanitizeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function toSanityId(prefix: string, type: string, sourceId: string): string {
  return sanitizeIdPart(`${prefix}-${type}-${sourceId}`);
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

function textFromPortableText(blocks: PortableTextBlock[]): string {
  return blocks
    .map((block) => block.children.map((child) => child.text).join(''))
    .join('\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function toIsoDate(value: string | null | undefined): string {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

function decodeTextFormat(format: unknown): string[] {
  if (typeof format !== 'number') {
    return [];
  }

  const marks: string[] = [];

  if (format & 1) {
    marks.push('strong');
  }

  if (format & 2) {
    marks.push('em');
  }

  if (format & 16) {
    marks.push('code');
  }

  return marks;
}

function lexicalToPortableText(value: unknown, keyScope: string): PortableTextBlock[] {
  const rootChildren =
    value &&
    typeof value === 'object' &&
    'root' in value &&
    value.root &&
    typeof value.root === 'object' &&
    'children' in value.root &&
    Array.isArray(value.root.children)
      ? (value.root.children as unknown[])
      : [];

  const blocks: PortableTextBlock[] = [];

  for (let i = 0; i < rootChildren.length; i += 1) {
    const node = rootChildren[i];
    blocks.push(...lexicalNodeToBlocks(node, `${keyScope}-${i}`));
  }

  if (blocks.length === 0) {
    blocks.push(makeParagraphBlock('normal', ' ', [], `${keyScope}-empty`));
  }

  return blocks;
}

function lexicalNodeToBlocks(node: unknown, keyScope: string): PortableTextBlock[] {
  if (!node || typeof node !== 'object') {
    return [];
  }

  const nodeType = typeof node.type === 'string' ? node.type : null;

  if (!nodeType) {
    return [];
  }

  if (nodeType === 'paragraph') {
    const style = typeof node.indent === 'number' && node.indent > 0 ? 'indent' : 'normal';
    const { spans, markDefs } = convertInlineChildren(
      Array.isArray(node.children) ? node.children : [],
      [],
      `${keyScope}-p`,
    );

    return [makeParagraphBlock(style, '', spans, keyScope, markDefs)];
  }

  if (nodeType === 'heading') {
    const tag = typeof node.tag === 'string' ? node.tag.toLowerCase() : '';
    const style: PortableTextBlock['style'] = tag === 'h3' ? 'h3' : 'h2';
    const { spans, markDefs } = convertInlineChildren(
      Array.isArray(node.children) ? node.children : [],
      [],
      `${keyScope}-h`,
    );

    return [makeParagraphBlock(style, '', spans, keyScope, markDefs)];
  }

  if (nodeType === 'quote') {
    const { spans, markDefs } = convertInlineChildren(
      Array.isArray(node.children) ? node.children : [],
      [],
      `${keyScope}-q`,
    );

    return [makeParagraphBlock('blockquote', '', spans, keyScope, markDefs)];
  }

  if (nodeType === 'list') {
    const listType: 'bullet' | 'number' =
      typeof node.listType === 'string' && node.listType.includes('number')
        ? 'number'
        : 'bullet';

    const listChildren = Array.isArray(node.children) ? node.children : [];
    const listBlocks: PortableTextBlock[] = [];

    for (let i = 0; i < listChildren.length; i += 1) {
      const child = listChildren[i];
      const childNodes =
        child && typeof child === 'object' && Array.isArray(child.children)
          ? (child.children as unknown[])
          : [];

      const { spans, markDefs } = convertInlineChildren(
        childNodes,
        [],
        `${keyScope}-li-${i}`,
      );

      const level =
        child && typeof child === 'object' && typeof child.indent === 'number'
          ? Math.max(1, child.indent + 1)
          : 1;

      const block = makeParagraphBlock('normal', '', spans, `${keyScope}-li-${i}`, markDefs);
      block.listItem = listType;
      block.level = level;
      listBlocks.push(block);
    }

    return listBlocks;
  }

  if (nodeType === 'block') {
    const fallbackText =
      node.fields &&
      typeof node.fields === 'object' &&
      node.fields.media &&
      typeof node.fields.media === 'object' &&
      typeof node.fields.media.filename === 'string'
        ? `[Embedded media: ${node.fields.media.filename}]`
        : '[Embedded block]';

    return [makeParagraphBlock('normal', fallbackText, [], keyScope)];
  }

  if (Array.isArray(node.children)) {
    const { spans, markDefs } = convertInlineChildren(node.children, [], `${keyScope}-fallback`);
    return [makeParagraphBlock('normal', '', spans, keyScope, markDefs)];
  }

  return [];
}

function convertInlineChildren(
  children: unknown[],
  inheritedMarks: string[],
  keyScope: string,
): {
  spans: PortableTextSpan[];
  markDefs: PortableTextMarkDef[];
} {
  const spans: PortableTextSpan[] = [];
  const markDefs: PortableTextMarkDef[] = [];
  const linkMarkBySignature = new Map<string, string>();

  function ensureLinkMark(href: string, blank: boolean): string {
    const signature = `${href}|${blank ? '1' : '0'}`;
    const existing = linkMarkBySignature.get(signature);
    if (existing) {
      return existing;
    }

    const key = makeKey('link', `${keyScope}-${signature}-${linkMarkBySignature.size}`);
    linkMarkBySignature.set(signature, key);
    markDefs.push({
      _key: key,
      _type: 'link',
      href,
      blank,
    });

    return key;
  }

  function walk(nodes: unknown[], currentMarks: string[], scope: string): void {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];

      if (!node || typeof node !== 'object') {
        continue;
      }

      const type = typeof node.type === 'string' ? node.type : null;

      if (type === 'text') {
        const text = typeof node.text === 'string' ? node.text : '';
        if (!text) {
          continue;
        }

        const marks = uniqueBy(
          [...currentMarks, ...decodeTextFormat(node.format)],
          (value) => value,
        );

        spans.push({
          _type: 'span',
          _key: makeKey('span', `${scope}-${index}-${spans.length}`),
          text,
          marks,
        });

        continue;
      }

      if (type === 'linebreak') {
        spans.push({
          _type: 'span',
          _key: makeKey('span', `${scope}-${index}-break-${spans.length}`),
          text: '\n',
          marks: [...currentMarks],
        });

        continue;
      }

      if (type === 'link') {
        const href =
          node.fields &&
          typeof node.fields === 'object' &&
          typeof node.fields.url === 'string'
            ? node.fields.url
            : null;

        const blank =
          Boolean(node.fields && typeof node.fields === 'object' && node.fields.newTab === true);

        const nextMarks = [...currentMarks];

        if (href) {
          nextMarks.push(ensureLinkMark(href, blank));
        }

        const childNodes = Array.isArray(node.children) ? node.children : [];
        walk(childNodes, nextMarks, `${scope}-${index}-link`);
        continue;
      }

      const childNodes = Array.isArray(node.children) ? node.children : [];
      if (childNodes.length > 0) {
        walk(childNodes, [...currentMarks], `${scope}-${index}`);
      }
    }
  }

  walk(children, inheritedMarks, keyScope);

  return {
    spans,
    markDefs,
  };
}

function makeParagraphBlock(
  style: PortableTextBlock['style'],
  fallbackText: string,
  spans: PortableTextSpan[],
  keyScope: string,
  markDefs: PortableTextMarkDef[] = [],
): PortableTextBlock {
  const normalizedSpans = spans.length
    ? spans
    : [
        {
          _type: 'span',
          _key: makeKey('span', `${keyScope}-fallback`),
          text: fallbackText || ' ',
          marks: [],
        },
      ];

  return {
    _type: 'block',
    _key: makeKey('block', keyScope),
    style,
    children: normalizedSpans,
    markDefs,
  };
}

function lexicalToPlainText(value: unknown, keyScope: string): string {
  return textFromPortableText(lexicalToPortableText(value, keyScope));
}

function extractPageBodyBlocks(
  page: PayloadPage | null,
  keyScope: string,
  options: {
    includeHeroRichText?: boolean;
    includeAuthorBio?: boolean;
    includeLayout?: boolean;
  } = {},
): PortableTextBlock[] {
  if (!page) {
    return [];
  }

  const includeHeroRichText = options.includeHeroRichText ?? true;
  const includeAuthorBio = options.includeAuthorBio ?? false;
  const includeLayout = options.includeLayout ?? false;
  const blocks: PortableTextBlock[] = [];

  if (includeHeroRichText && page.hero?.richText) {
    blocks.push(...lexicalToPortableText(page.hero.richText, `${keyScope}-hero`));
  }

  if (includeAuthorBio && page.hero?.authorBio) {
    blocks.push(...lexicalToPortableText(page.hero.authorBio, `${keyScope}-bio`));
  }

  if (!includeLayout) {
    return blocks;
  }

  for (const [layoutIndex, layoutBlock] of (page.layout ?? []).entries()) {
    const heading = layoutBlock.heading?.trim();
    if (heading) {
      blocks.push(
        makeParagraphBlock(
          'h2',
          heading,
          [],
          `${keyScope}-layout-${layoutIndex}-heading`,
        ),
      );
    }

    const description = layoutBlock.description?.trim();
    if (description) {
      blocks.push(
        makeParagraphBlock(
          'normal',
          description,
          [],
          `${keyScope}-layout-${layoutIndex}-description`,
        ),
      );
    }

    for (const [columnIndex, column] of (layoutBlock.columns ?? []).entries()) {
      if (!column.richText) {
        continue;
      }

      blocks.push(
        ...lexicalToPortableText(
          column.richText,
          `${keyScope}-layout-${layoutIndex}-column-${columnIndex}`,
        ),
      );
    }
  }

  return blocks;
}

function mapContentKind(categories: PayloadCategory[]): 'blog' | 'short-story' | 'essay' {
  const haystack = categories
    .flatMap((category) => [category.slug ?? '', category.title ?? ''])
    .join(' ')
    .toLowerCase();

  if (haystack.includes('short') || haystack.includes('story')) {
    return 'short-story';
  }

  if (haystack.includes('essay')) {
    return 'essay';
  }

  return 'blog';
}

function normalizePostCategories(
  post: PayloadPost,
  byId: Map<string, PayloadCategory>,
): PayloadCategory[] {
  const categories = post.categories ?? [];
  const resolved: PayloadCategory[] = [];

  for (const category of categories) {
    if (category && typeof category === 'object' && 'id' in category) {
      const payloadCategory: PayloadCategory = {
        id: category.id,
        title: typeof category.title === 'string' ? category.title : null,
        slug: typeof category.slug === 'string' ? category.slug : null,
      };

      resolved.push(payloadCategory);
      continue;
    }

    const lookup = byId.get(String(category));
    if (lookup) {
      resolved.push(lookup);
    }
  }

  return uniqueBy(resolved, (category) => String(category.id));
}

async function fetchJson<T>(url: string, headers: HeadersInit): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}) for ${url}\n${body.slice(0, 500)}`);
  }

  return (await response.json()) as T;
}

async function fetchAllCollection<T>(
  apiBaseUrl: string,
  collection: string,
  headers: HeadersInit,
  options: {
    depth?: number;
    includeDrafts?: boolean;
  } = {},
): Promise<T[]> {
  const depth = options.depth ?? 2;
  const includeDrafts = options.includeDrafts ?? false;
  const limit = 100;
  let page = 1;
  const docs: T[] = [];

  while (true) {
    const url = new URL(`${apiBaseUrl}/${collection}`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('page', String(page));
    url.searchParams.set('depth', String(depth));

    if (!includeDrafts) {
      url.searchParams.set('where[_status][equals]', 'published');
    }

    const payload = await fetchJson<PayloadListResponse<T>>(url.toString(), headers);
    docs.push(...payload.docs);

    if (page >= payload.totalPages) {
      break;
    }

    page += 1;
  }

  return docs;
}

async function fetchGlobal<T>(apiBaseUrl: string, slug: string, headers: HeadersInit): Promise<T | null> {
  const url = `${apiBaseUrl}/globals/${slug}`;
  const response = await fetch(url, { headers });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Global fetch failed (${response.status}) for ${slug}\n${body.slice(0, 500)}`);
  }

  return (await response.json()) as T;
}

async function fetchPageBySlug(
  apiBaseUrl: string,
  slug: string,
  headers: HeadersInit,
): Promise<PayloadPage | null> {
  const url = new URL(`${apiBaseUrl}/pages`);
  url.searchParams.set('where[slug][equals]', slug);
  url.searchParams.set('depth', '2');
  url.searchParams.set('limit', '1');

  const result = await fetchJson<PayloadListResponse<PayloadPage>>(url.toString(), headers);
  return result.docs[0] ?? null;
}

function normalizeNavHref(rawHref: string): string {
  const href = rawHref.trim();

  if (!href) {
    return href;
  }

  if (href === '/home') {
    return '/';
  }

  if (href === '/posts' || href === '/short-stories') {
    return '/writing';
  }

  return href;
}

function navHrefFromItem(item: PayloadHeaderGlobal['navItems'][number]): string | null {
  const link = item.link;

  if (!link) {
    return null;
  }

  if (link.type === 'custom' && typeof link.url === 'string') {
    return normalizeNavHref(link.url);
  }

  if (
    link.type === 'reference' &&
    link.reference?.value?.slug &&
    typeof link.reference.value.slug === 'string'
  ) {
    return normalizeNavHref(`/${link.reference.value.slug}`);
  }

  return null;
}

async function uploadImageToSanity(
  client: SanityClient,
  payloadBaseUrl: string,
  media: PayloadMedia | null | undefined,
  assetRefBySource: Map<string, string>,
  options: {
    dryRun: boolean;
    skipImages: boolean;
  },
): Promise<SanityImageField | undefined> {
  if (!media?.url) {
    return undefined;
  }

  const sourceId = String(media.id ?? media.url);
  const cached = assetRefBySource.get(sourceId);

  const altFallback = typeof media.alt === 'string' && media.alt.trim().length > 0 ? media.alt.trim() : '';

  if (cached) {
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: cached,
      },
      alt: altFallback,
    };
  }

  if (options.skipImages || options.dryRun) {
    const placeholderRef = `dryrun-image-${hashKey(sourceId)}`;
    assetRefBySource.set(sourceId, placeholderRef);

    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: placeholderRef,
      },
      alt: altFallback,
    };
  }

  const imageUrl = toAbsoluteUrl(payloadBaseUrl, media.url);
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed downloading media ${imageUrl} (${response.status})`);
  }

  const blob = await response.blob();
  const filename = media.filename ?? `payload-media-${sourceId}`;
  const contentType = media.mimeType ?? blob.type ?? 'application/octet-stream';

  const uploaded = await client.assets.upload('image', blob, {
    filename,
    contentType,
  });

  assetRefBySource.set(sourceId, uploaded._id);

  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: uploaded._id,
    },
    alt: altFallback,
  };
}

async function upsertDocuments(
  client: SanityClient,
  documents: Array<Record<string, unknown>>,
  options: { dryRun: boolean; verbose: boolean },
): Promise<void> {
  if (options.dryRun) {
    return;
  }

  const chunkSize = 20;

  for (let i = 0; i < documents.length; i += chunkSize) {
    const chunk = documents.slice(i, i + chunkSize);
    const transaction = client.transaction();

    for (const document of chunk) {
      transaction.createOrReplace(document);
    }

    await transaction.commit({
      visibility: 'sync',
      autoGenerateArrayKeys: true,
    });

    if (options.verbose) {
      console.log(`Committed ${Math.min(i + chunkSize, documents.length)} / ${documents.length} docs`);
    }
  }
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  const payloadBaseUrl = normalizeBaseUrl(
    process.env.PAYLOAD_BASE_URL || 'https://www.chriszombik.com',
  );
  const payloadApiPath = process.env.PAYLOAD_API_PATH || '/api';
  const payloadApiBaseUrl = normalizeBaseUrl(toAbsoluteUrl(payloadBaseUrl, payloadApiPath));

  const sourcePrefix = sanitizeIdPart(process.env.SANITY_IMPORT_SOURCE_PREFIX || 'payload-cz');

  const sanityProjectId =
    process.env.SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || '';
  const sanityDataset =
    process.env.SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || '';
  const sanityApiVersion =
    process.env.SANITY_API_VERSION || process.env.PUBLIC_SANITY_API_VERSION || '2025-01-01';
  const sanityToken = process.env.SANITY_WRITE_TOKEN || '';

  invariant(sanityProjectId, 'Missing SANITY_PROJECT_ID (or PUBLIC_SANITY_PROJECT_ID).');
  invariant(sanityDataset, 'Missing SANITY_DATASET (or PUBLIC_SANITY_DATASET).');

  if (!options.dryRun) {
    invariant(
      sanityToken,
      'Missing SANITY_WRITE_TOKEN. Required for non-dry-run imports.',
    );
  }

  const payloadHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  if (process.env.PAYLOAD_AUTH_HEADER) {
    payloadHeaders.Authorization = process.env.PAYLOAD_AUTH_HEADER;
  } else if (process.env.PAYLOAD_API_TOKEN) {
    payloadHeaders.Authorization = `JWT ${process.env.PAYLOAD_API_TOKEN}`;
  }

  const sanityClient = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token: sanityToken || undefined,
    useCdn: false,
  });

  console.log(`Payload source: ${payloadApiBaseUrl}`);
  console.log(`Sanity target: ${sanityProjectId}/${sanityDataset}`);
  console.log(`Mode: ${options.dryRun ? 'dry-run' : 'write'}`);

  const [posts, categories, headerGlobal, footerGlobal, homePage, aboutPage, nowPage] = await Promise.all([
    fetchAllCollection<PayloadPost>(payloadApiBaseUrl, 'posts', payloadHeaders, {
      depth: 2,
      includeDrafts: options.includeDrafts,
    }),
    fetchAllCollection<PayloadCategory>(payloadApiBaseUrl, 'categories', payloadHeaders, {
      depth: 2,
      includeDrafts: true,
    }),
    fetchGlobal<PayloadHeaderGlobal>(payloadApiBaseUrl, 'header', payloadHeaders),
    fetchGlobal<PayloadFooterGlobal>(payloadApiBaseUrl, 'footer', payloadHeaders),
    fetchPageBySlug(payloadApiBaseUrl, 'home', payloadHeaders),
    fetchPageBySlug(payloadApiBaseUrl, 'about', payloadHeaders),
    fetchPageBySlug(payloadApiBaseUrl, 'now', payloadHeaders),
  ]);

  if (options.verbose) {
    console.log(`Fetched ${posts.length} post(s), ${categories.length} categor(ies).`);
  }

  const categoryById = new Map<string, PayloadCategory>();
  for (const category of categories) {
    categoryById.set(String(category.id), category);
  }

  const tagDocs = uniqueBy(
    categories
      .filter((category) => category.slug && category.title)
      .map((category) => ({
        _id: toSanityId(sourcePrefix, 'tag', String(category.id)),
        _type: 'tag',
        title: truncate(String(category.title).trim(), 50),
        slug: {
          _type: 'slug',
          current: String(category.slug).trim(),
        },
      })),
    (doc) => String(doc._id),
  );

  const socialLinks = (footerGlobal?.socialLinks ?? [])
    .filter((link) => typeof link.url === 'string' && link.url.trim().length > 0)
    .map((link) => ({
      _type: 'socialLink',
      label: truncate(
        (typeof link.platform === 'string' && link.platform.trim().length > 0
          ? link.platform
          : 'Link'
        )
          .replace(/^\w/, (m) => m.toUpperCase())
          .trim(),
        40,
      ),
      url: link.url!.trim(),
    }));

  const aboutBioLexical = aboutPage?.hero?.authorBio;
  const aboutBioText = truncate(
    lexicalToPlainText(aboutBioLexical, `${sourcePrefix}-about-bio`) ||
      'Chris writes fiction and nonfiction while advising educators on curriculum and instruction.',
    790,
  );

  const authorNameFromPosts = uniqueBy(
    posts.flatMap((post) => post.populatedAuthors ?? []),
    (author) => String(author.id),
  );

  const authorDocs = (authorNameFromPosts.length > 0
    ? authorNameFromPosts
    : [{ id: 'chris-zombik', name: 'Chris Zombik' }]
  ).map((author, index) => ({
    _id: toSanityId(sourcePrefix, 'author', String(author.id)),
    _type: 'author',
    name:
      typeof author.name === 'string' && author.name.trim().length > 0
        ? truncate(author.name.trim(), 120)
        : 'Chris Zombik',
    roleLine: 'Writer and educational consultant',
    bio:
      index === 0
        ? aboutBioText
        : 'Writer and educational consultant.',
    socialLinks: index === 0 ? socialLinks : [],
  }));

  const authorIdForPrimary = String(authorDocs[0]?._id);
  const tagIdByPayloadId = new Map<string, string>();

  for (const category of categories) {
    const tagId = toSanityId(sourcePrefix, 'tag', String(category.id));
    tagIdByPayloadId.set(String(category.id), tagId);
  }

  const assetRefBySource = new Map<string, string>();
  let imagesUploaded = 0;

  const postDocs: Array<Record<string, unknown>> = [];

  for (const post of posts) {
    if (!post.slug || !post.title) {
      continue;
    }

    const categoryDocs = normalizePostCategories(post, categoryById);
    const tagRefs = categoryDocs
      .map((category) => tagIdByPayloadId.get(String(category.id)))
      .filter((refId): refId is string => Boolean(refId))
      .map((refId) => ({
        _type: 'reference',
        _ref: refId,
      }));

    const portableTextBody = lexicalToPortableText(
      post.content,
      `${sourcePrefix}-post-${post.id}`,
    );

    const excerptSource =
      (typeof post.meta?.description === 'string' && post.meta.description.trim()) ||
      textFromPortableText(portableTextBody);

    const heroImage = await uploadImageToSanity(
      sanityClient,
      payloadBaseUrl,
      post.heroImage,
      assetRefBySource,
      {
        dryRun: options.dryRun,
        skipImages: options.skipImages,
      },
    );

    if (heroImage && !options.dryRun && !options.skipImages) {
      imagesUploaded += 1;
    }

    if (heroImage) {
      heroImage.alt =
        heroImage.alt && heroImage.alt.trim().length > 0
          ? truncate(heroImage.alt.trim(), 200)
          : truncate(post.title, 200);
    }

    const postDoc = {
      _id: toSanityId(sourcePrefix, 'post', String(post.id)),
      _type: 'post',
      title: truncate(post.title.trim(), 160),
      slug: {
        _type: 'slug',
        current: post.slug.trim(),
      },
      publishedAt: toIsoDate(post.publishedAt ?? post.updatedAt),
      excerpt: truncate(excerptSource || post.title, 300),
      contentKind: mapContentKind(categoryDocs),
      tags: tagRefs,
      body: portableTextBody,
      heroImage,
    } satisfies Record<string, unknown>;

    postDocs.push(postDoc);
  }

  const featuredPostRefs = postDocs
    .slice()
    .sort((a, b) => {
      const aDate = typeof a.publishedAt === 'string' ? new Date(a.publishedAt).valueOf() : 0;
      const bDate = typeof b.publishedAt === 'string' ? new Date(b.publishedAt).valueOf() : 0;
      return bDate - aDate;
    })
    .slice(0, 3)
    .map((doc) => ({
      _type: 'reference',
      _ref: String(doc._id),
    }));

  const homeHeroBlocks = extractPageBodyBlocks(homePage, `${sourcePrefix}-home`, {
    includeHeroRichText: true,
    includeAuthorBio: false,
    includeLayout: false,
  });
  const homeHeroHeadingBlock = homeHeroBlocks.find((block) => block.style === 'h2' || block.style === 'h3');
  const homeHeroParagraphBlock = homeHeroBlocks.find((block) => block.style === 'normal');

  const homeHeroHeading = truncate(
    textFromPortableText(homeHeroHeadingBlock ? [homeHeroHeadingBlock] : homeHeroBlocks) ||
      'Chris Zombik',
    120,
  );

  const homeHeroSubheading = truncate(
    textFromPortableText(homeHeroParagraphBlock ? [homeHeroParagraphBlock] : homeHeroBlocks) ||
      'Writer and educational consultant',
    220,
  );

  const homeIntroBlocks = homeHeroBlocks.filter((block) => block.style === 'normal').slice(0, 2);
  const homeIntro = homeIntroBlocks.length > 0 ? homeIntroBlocks : [makeParagraphBlock('normal', homeHeroSubheading, [], `${sourcePrefix}-home-intro`)];

  const aboutBlocks = extractPageBodyBlocks(aboutPage, `${sourcePrefix}-about`, {
    includeHeroRichText: false,
    includeAuthorBio: true,
    includeLayout: false,
  });

  const nowBlocksRaw = extractPageBodyBlocks(nowPage, `${sourcePrefix}-now`, {
    includeHeroRichText: true,
    includeAuthorBio: false,
    includeLayout: true,
  });

  const nowBlocks = nowBlocksRaw.length > 0
    ? nowBlocksRaw
    : [makeParagraphBlock('normal', 'No updates yet.', [], `${sourcePrefix}-now-empty`)];

  const aboutImage = await uploadImageToSanity(
    sanityClient,
    payloadBaseUrl,
    aboutPage?.hero?.authorImage,
    assetRefBySource,
    {
      dryRun: options.dryRun,
      skipImages: options.skipImages,
    },
  );

  if (aboutImage && !options.dryRun && !options.skipImages) {
    imagesUploaded += 1;
  }

  if (aboutImage) {
    aboutImage.alt =
      aboutImage.alt && aboutImage.alt.trim().length > 0
        ? truncate(aboutImage.alt.trim(), 200)
        : 'Chris Zombik';
  }

  if (authorDocs[0]) {
    authorDocs[0].portrait = aboutImage;
  }

  const nowTitle = truncate(nowPage?.title?.trim() || 'Now', 120);
  const nowLastUpdated = nowPage
    ? toIsoDate(nowPage.updatedAt ?? nowPage.publishedAt).slice(0, 10)
    : undefined;

  const headerNavItems = (headerGlobal?.navItems ?? [])
    .map((item) => {
      const title = item.link?.label?.trim();
      const href = navHrefFromItem(item);

      if (!title || !href) {
        return null;
      }

      return {
        _type: 'navItem',
        title: truncate(title, 40),
        href: truncate(href, 120),
      };
    })
    .filter((item): item is { _type: 'navItem'; title: string; href: string } => Boolean(item));

  const singletons: Array<Record<string, unknown>> = [
    {
      _id: toSanityId(sourcePrefix, 'homePage', 'main'),
      _type: 'homePage',
      heroHeading: homeHeroHeading,
      heroSubheading: homeHeroSubheading,
      intro: homeIntro,
      featuredPosts: featuredPostRefs,
    },
    {
      _id: toSanityId(sourcePrefix, 'aboutPage', 'main'),
      _type: 'aboutPage',
      title: truncate(aboutPage?.title?.trim() || 'About Chris', 120),
      body: aboutBlocks,
    },
    {
      _id: toSanityId(sourcePrefix, 'nowPage', 'main'),
      _type: 'nowPage',
      title: nowTitle,
      ...(nowLastUpdated ? { lastUpdated: nowLastUpdated } : {}),
      body: nowBlocks,
    },
    {
      _id: toSanityId(sourcePrefix, 'siteSettings', 'main'),
      _type: 'siteSettings',
      siteTitle: 'Chris Zombik',
      siteDescription: truncate(homeHeroSubheading, 180),
      navItems: headerNavItems,
    },
  ];

  const allDocs: Array<Record<string, unknown>> = [
    ...tagDocs,
    ...authorDocs,
    ...postDocs,
    ...singletons,
  ];

  const summary: ImportSummary = {
    tags: tagDocs.length,
    authors: authorDocs.length,
    posts: postDocs.length,
    homePage: 1,
    aboutPage: 1,
    nowPage: 1,
    siteSettings: 1,
    imagesUploaded,
  };

  if (options.dryRun) {
    const preview = {
      summary,
      sample: {
        tag: tagDocs[0] ?? null,
        author: authorDocs[0] ?? null,
        post: postDocs[0] ?? null,
        homePage: singletons[0],
        nowPage: singletons[2],
      },
    };

    await Bun.write(
      './payload-import-preview.json',
      `${JSON.stringify(preview, null, 2)}\n`,
    );

    console.log('Dry-run complete. No writes were made.');
    console.log('Preview written to ./payload-import-preview.json');
    console.log(summary);
    return;
  }

  await upsertDocuments(sanityClient, allDocs, {
    dryRun: options.dryRun,
    verbose: options.verbose,
  });

  console.log('Import complete.');
  console.log(summary);
  console.log('Primary author id:', authorIdForPrimary);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
