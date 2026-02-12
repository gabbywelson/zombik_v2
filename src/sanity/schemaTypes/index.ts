import { aboutPageType } from './documents/aboutPage';
import { authorType } from './documents/author';
import { contactSubmissionType } from './documents/contactSubmission';
import { homePageType } from './documents/homePage';
import { nowPageType } from './documents/nowPage';
import { postType } from './documents/post';
import { siteSettingsType } from './documents/siteSettings';
import { tagType } from './documents/tag';
import { writingType } from './documents/writing';

export const schemaTypes = [
  postType,
  writingType,
  tagType,
  authorType,
  contactSubmissionType,
  homePageType,
  aboutPageType,
  nowPageType,
  siteSettingsType,
];
