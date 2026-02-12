import { createImageUrlBuilder } from '@sanity/image-url';
import { createClient } from '@sanity/client';
import type { SanityImageSource } from './sanity.types';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? '';
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION ?? '2025-01-01';

const placeholderIds = ['replace-with-project-id', 'your-project-id', ''];

export const isSanityConfigured =
  !placeholderIds.includes(projectId) &&
  dataset.trim().length > 0 &&
  projectId.trim().length > 0;

export const sanityClient = createClient({
  projectId: projectId || 'replace-with-project-id',
  dataset: dataset || 'production',
  apiVersion,
  useCdn: false,
});

const imageBuilder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource) {
  return imageBuilder.image(source).auto('format').fit('max');
}

export function hasImageAsset(source?: SanityImageSource): source is SanityImageSource {
  return Boolean(source?.asset?._ref);
}
