import { aboutPageType } from './documents/aboutPage';
import { authorType } from './documents/author';
import { homePageType } from './documents/homePage';
import { postType } from './documents/post';
import { siteSettingsType } from './documents/siteSettings';
import { tagType } from './documents/tag';

export const schemaTypes = [
  postType,
  tagType,
  authorType,
  homePageType,
  aboutPageType,
  siteSettingsType,
];
