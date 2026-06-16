// Single source of truth for identity, links, and SEO metadata.
// Facts here mirror the résumé exactly — see project-content-canonical memory.

export const site = {
  name: 'Divyanshu Kumar',
  tagline: 'Business operator who can build.',
  role: 'BBA Finance & Marketing Analytics · CHRIST University',
  // Used for <title>, meta description, OG/Twitter, and JSON-LD.
  description:
    'Divyanshu Kumar — business operator who builds. Runs credit operations at a 25-year MSME lending firm (₹100Cr+ deal value, 15 bank partners) and ships AI products in finance: FinSight (1st, IIT Roorkee), Sustainmetric, and Cosmos (UN Fellow).',
  url: 'https://novaxtritan.github.io/novaxtritanxmetamorphosis/',
  // Square portrait; doubles as the social-card image for now.
  // TODO: replace with a dedicated 1200×630 OG card for richer link previews.
  ogImage: 'https://novaxtritan.github.io/novaxtritanxmetamorphosis/images/1745733549930.jpg',
  locale: 'en_IN',
} as const;

export const contact = {
  email: 'divyanshu@nova-cosmos.com',
  linkedin: 'https://www.linkedin.com/in/divyanshukumar27',
  linkedinLabel: 'linkedin.com/in/divyanshukumar27',
  github: 'https://github.com/NovaXTritan',
  githubLabel: 'github.com/NovaXTritan',
  resume: 'Divyanshu_Kumar_Resume.pdf', // lives in /public, prefixed with BASE_URL at use
} as const;

// Resolve a path that lives in /public against the configured base path.
export const asset = (path: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
