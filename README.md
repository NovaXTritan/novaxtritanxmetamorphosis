# Divyanshu Kumar — Portfolio

Business operator who can build. Management consulting, MSME credit operations, and AI products in finance.

**Live:** [novaxtritan.github.io/novaxtritanxmetamorphosis](https://novaxtritan.github.io/novaxtritanxmetamorphosis/)

## Stack

Static site built with [Astro](https://astro.build) — ships ~zero client JS, self-hosted variable fonts (Fraunces + Inter), one hand-written stylesheet. Editorial / financial-publication design direction.

## Develop

```bash
npm install      # once
npm run dev      # local dev server at http://localhost:4321/novaxtritanxmetamorphosis/
npm run build    # production build → ./dist
npm run preview  # serve the built ./dist locally
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `astro build`
and publishes `./dist` to GitHub Pages. The base path (`/novaxtritanxmetamorphosis`)
is set in `astro.config.mjs`.

> One-time setup: repo **Settings → Pages → Build and deployment → Source = GitHub Actions**.

## Structure

```
src/
  pages/index.astro      single page, composes the sections
  layouts/Base.astro     <head>, SEO/OG/JSON-LD, scroll-reveal + SW cleanup
  components/            Nav, Hero, Experience, Projects, Recognition, Skills, Contact, Footer
  data/site.ts           identity, links, SEO metadata
  styles/global.css      design system (one stylesheet)
public/                  résumé PDF, images, manifest, robots, sitemap, favicon assets
```
