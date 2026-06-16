// Single source of truth for identity, links, and SEO metadata.
// Prose lives inside the components (it belongs next to its markup); only the
// reused, structured bits sit here.

export const site = {
  name: 'Divyanshu Kumar',
  tagline: 'Business operator who can build.',
  role: 'BBA Finance & Marketing Analytics · Christ University',
  // Used for <title>, meta description, OG/Twitter, and JSON-LD.
  description:
    'Divyanshu Kumar — business operator who builds. Management consulting (₹45L+ cost savings identified) and a 25-year family MSME loan consultancy (₹600+ crore deal flow). Building AI products at the intersection of finance and consulting.',
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
