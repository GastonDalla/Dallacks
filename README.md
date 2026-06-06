# Dallacks

Discover music that sounds alike. Type a track name (with live autocomplete) or paste a Discogs / YouTube / SoundCloud link, and Dallacks returns similar-sounding tracks you can play right in the page — powered by the [cosine.club](https://cosine.club) API.

## Features

- **Search by name** with an accessible autocomplete combobox, or **by link** (Discogs / YouTube / SoundCloud).
- **Similar tracks** ranked by similarity, with filters (year, collectors, wishlists, price).
- **In-page player**: play any track without leaving the site, with a continuous queue + auto-advance, seek bar, volume, and keyboard shortcuts.
- **Bulk search**: up to 50 tracks at once, with the unmatched ones reported back.
- **Bilingual** (Spanish / English) with localized routing and SEO.
- **Dynamic OG images**, sitemap, robots and `llms.txt` for SEO/GEO.
- Installable **PWA** with safe-area support for mobile.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev), TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com)
- [next-intl](https://next-intl.dev) for i18n
- [TanStack Query](https://tanstack.com/query) for client data fetching
- [Zod](https://zod.dev) for runtime validation
- [Vitest](https://vitest.dev) + Testing Library + [MSW](https://mswjs.io) for tests
- Self-hosted Clash Display + Satoshi fonts ([Fontshare](https://fontshare.com))

## Getting started

Requirements: Node.js 20+ and a [cosine.club API key](https://cosine.club/account/api).

```bash
# 1. Install dependencies
npm install

# 2. Configure your environment
cp .env.example .env.local
# then edit .env.local and set your COSINE_API_KEY

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `COSINE_API_KEY` | yes | cosine.club API key. Read only on the server — never exposed to the browser. |
| `COSINE_API_BASE_URL` | no | Override the upstream base URL (defaults to `https://cosine.club/api/v1`). |
| `NEXT_PUBLIC_SITE_URL` | no | Public site URL for canonical/OG/sitemap. |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with `tsc` |
| `npm run test` | Run the test suite |

## How it works

The cosine.club API key never reaches the browser. All upstream calls go through a Next.js **BFF proxy** (`/api/*`) that adds authentication, validates input and responses with Zod, rate-limits per IP, and guards the lookup endpoint against SSRF. The browser only talks to our own API.
