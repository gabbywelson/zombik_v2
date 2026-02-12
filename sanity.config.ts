import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { PortableTextPlugins } from './src/sanity/portableText/PortableTextPlugins';
import { schemaTypes } from './src/sanity/schemaTypes';

const projectId =
  import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'replace-with-project-id';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const studioBasePath = import.meta.env.SANITY_STUDIO_BASE_PATH || '/studio';

export default defineConfig({
  name: 'default',
  title: 'Chris Zombik Studio',
  projectId,
  dataset,
  basePath: studioBasePath,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
  form: {
    components: {
      portableText: {
        plugins: PortableTextPlugins,
      },
    },
  },
});
