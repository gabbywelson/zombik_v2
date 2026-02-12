import type {
  AboutPageData,
  AuthorData,
  HomePageData,
  NowPageData,
  PostPageData,
  SiteSettingsData,
  TagData,
} from './sanity.types';

const tagCraft: TagData = { title: 'Craft', slug: 'craft' };
const tagFiction: TagData = { title: 'Fiction', slug: 'fiction' };
const tagTeaching: TagData = { title: 'Teaching', slug: 'teaching' };

export const fallbackPosts: PostPageData[] = [
  {
    _id: 'fallback-1',
    title: 'A Desk, a Window, and a First Draft',
    slug: 'a-desk-a-window-and-a-first-draft',
    publishedAt: '2026-01-20T16:00:00.000Z',
    excerpt:
      'Notes on developing a daily writing practice while balancing education consulting work.',
    contentKind: 'blog',
    tags: [tagCraft, tagTeaching],
    body: [
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        markDefs: [
          {
            _type: 'footnote',
            _key: 'fn1',
            note: [
              {
                _type: 'block',
                _key: 'fnb1',
                style: 'normal',
                markDefs: [],
                children: [
                  {
                    _type: 'span',
                    _key: 'fns1',
                    text: 'This routine began as a six-week experiment in 2024.',
                    marks: [],
                  },
                ],
              },
            ],
          },
        ],
        children: [
          {
            _type: 'span',
            _key: 'p1s1',
            text: 'Most days I begin with twenty quiet minutes and one open paragraph',
            marks: [],
          },
          {
            _type: 'span',
            _key: 'p1s2',
            text: '. ',
            marks: [],
          },
          {
            _type: 'span',
            _key: 'p1s3',
            text: 'The routine is small on purpose',
            marks: ['fn1'],
          },
          {
            _type: 'span',
            _key: 'p1s4',
            text: '.',
            marks: [],
          },
        ],
      },
      {
        _type: 'block',
        _key: 'p2',
        style: 'indent',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'p2s1',
            text: 'I write until I surprise myself, then I stop for the day.',
            marks: [],
          },
        ],
      },
    ],
  },
  {
    _id: 'fallback-2',
    title: 'Field Notes from a Quiet Midwestern Winter',
    slug: 'field-notes-from-a-quiet-midwestern-winter',
    publishedAt: '2025-12-02T17:30:00.000Z',
    excerpt:
      'A short story draft excerpt about small-town myth, family memory, and weather.',
    contentKind: 'short-story',
    tags: [tagFiction],
    body: [
      {
        _type: 'block',
        _key: 's1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 's1t1',
            text: 'The snow came down in patient lines, almost too gentle to notice at first.',
            marks: [],
          },
        ],
      },
      {
        _type: 'block',
        _key: 's2',
        style: 'blockquote',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 's2t1',
            text: 'By dusk the road had forgotten every tire that crossed it.',
            marks: [],
          },
        ],
      },
    ],
  },
  {
    _id: 'fallback-3',
    title: 'What Revision Teaches About Attention',
    slug: 'what-revision-teaches-about-attention',
    publishedAt: '2025-10-05T15:00:00.000Z',
    excerpt:
      'An essay on revision habits, reading like an editor, and finding the true argument in a draft.',
    contentKind: 'essay',
    tags: [tagCraft],
    body: [
      {
        _type: 'block',
        _key: 'e1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'e1t1',
            text: 'Revision is not only correction. It is a method for paying deeper attention.',
            marks: [],
          },
        ],
      },
    ],
  },
];

export const fallbackHomePage: HomePageData = {
  heroHeading: 'Chris Zombik',
  heroSubheading: 'Writer and educational consultant',
  intro: [
    {
      _type: 'block',
      _key: 'h1',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'h1t1',
          text: 'This site is a home base for essays, stories, and notes from the writing life.',
          marks: [],
        },
      ],
    },
  ],
  featuredPosts: fallbackPosts.slice(0, 2).map((post) => ({
    _id: post._id,
    title: post.title,
    slug: post.slug,
    publishedAt: post.publishedAt,
    excerpt: post.excerpt,
    contentKind: post.contentKind,
    heroImage: post.heroImage,
    tags: post.tags,
  })),
};

export const fallbackAboutPage: AboutPageData = {
  title: 'About Chris',
  body: [
    {
      _type: 'block',
      _key: 'a1',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'a1t1',
          text:
            'Chris Zombik is a writer and educational consultant currently applying to MFA programs while preparing his first novel for literary agents.',
          marks: [],
        },
      ],
    },
    {
      _type: 'block',
      _key: 'a2',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'a2t1',
          text:
            'He writes fiction and criticism, with a focus on memory, language, and place.',
          marks: [],
        },
      ],
    },
  ],
};

export const fallbackAuthor: AuthorData = {
  name: 'Chris Zombik',
  roleLine: 'Writer and educational consultant',
  bio: 'Chris writes fiction and nonfiction while advising educators on curriculum and instruction.',
  socialLinks: [],
};

export const fallbackNowPage: NowPageData = {
  title: 'Now',
  lastUpdated: '2026-02-12',
  body: [
    {
      _type: 'block',
      _key: 'n1',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'n1t1',
          text:
            'This is a now page inspired by Derek Sivers. It is a snapshot of what I am focused on right now, not a permanent bio.',
          marks: [],
        },
      ],
    },
    {
      _type: 'block',
      _key: 'n2',
      style: 'h2',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'n2t1',
          text: 'Writing',
          marks: [],
        },
      ],
    },
    {
      _type: 'block',
      _key: 'n3',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'n3t1',
          text:
            'I am revising my first novel and preparing applications for MFA programs while sharing short stories and essays.',
          marks: [],
        },
      ],
    },
    {
      _type: 'block',
      _key: 'n4',
      style: 'h2',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'n4t1',
          text: 'Work',
          marks: [],
        },
      ],
    },
    {
      _type: 'block',
      _key: 'n5',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'n5t1',
          text:
            'I continue consulting with educators and school teams on curriculum, planning, and instruction.',
          marks: [],
        },
      ],
    },
  ],
};

export const fallbackSiteSettings: SiteSettingsData = {
  siteTitle: 'Chris Zombik',
  siteDescription:
    'Writing by Chris Zombik: short stories, essays, and blog posts on craft and education.',
  navItems: [
    { title: 'Home', href: '/' },
    { title: 'Writing', href: '/writing' },
    { title: 'Now', href: '/now' },
    { title: 'About', href: '/about' },
  ],
};
