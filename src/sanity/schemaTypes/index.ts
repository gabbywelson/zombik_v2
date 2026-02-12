import { aboutPageType } from './documents/aboutPage';
import { authorType } from './documents/author';
import { homePageType } from './documents/homePage';
import { nowPageType } from './documents/nowPage';
import { postType } from './documents/post';
import { siteSettingsType } from './documents/siteSettings';
import { tagType } from './documents/tag';

export const schemaTypes = [
  postType,
  tagType,
  authorType,
  homePageType,
  aboutPageType,
  nowPageType,
  siteSettingsType,
];
