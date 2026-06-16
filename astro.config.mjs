// @ts-check
import { defineConfig } from 'astro/config';

// The site lives at https://novaxtritan.github.io/novaxtritanxmetamorphosis/
// `site` + `base` together let Astro emit correct canonical URLs and asset
// paths. BASE_URL (used in components) resolves to "/novaxtritanxmetamorphosis/".
export default defineConfig({
  site: 'https://novaxtritan.github.io',
  base: '/novaxtritanxmetamorphosis',
  trailingSlash: 'ignore',
  // Keep the build lean — no client framework, mostly static HTML.
  build: {
    assets: '_assets',
  },
});
