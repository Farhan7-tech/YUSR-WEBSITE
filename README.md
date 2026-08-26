# YUSR AI — Marketing Website

The marketing site for [YUSR AI](https://yusr.co.in), a WhatsApp CRM for Indian businesses: a shared team inbox, bulk broadcasts from Google Sheets, and an AI assistant trained on the business's own catalog.

This repo is the website only. The product itself (the app at `app.yusr.co.in`) lives in a separate, private repository.

## Stack

Plain, hand written HTML, CSS and JavaScript. No build step, no framework, no npm dependencies.

- 12 static pages (including a custom `404.html`), one file each (`index.html`, `features.html`, `pricing.html`, ...)
- `yusr.css` — one stylesheet for the whole site
- `yusr.js` — one script for the whole site: reveal animations, count-up numbers, the live counter tape, mobile nav, event tracking, and the cookie consent banner
- Fonts load from Google Fonts (Bricolage Grotesque, Hanken Grotesk, Fragment Mono)

## Running locally

There's no dev server or build step. Serve the folder with anything that speaks static files, for example:

```bash
npx serve .
```

or open `index.html` directly in a browser. `_redirects` (clean URLs like `/pricing` instead of `/pricing.html`) and `_headers` (caching, security headers) only take effect once deployed to Cloudflare Pages; a local static server won't apply them.

## Deployment

Hosted on **Cloudflare Pages**, deployed from this repo's `main` branch. Cloudflare Web Analytics is already wired in at the edge (not visible in this source, since Cloudflare injects it into the served page).

**Cache busting is manual and load bearing.** `_headers` serves `yusr.css` and `yusr.js` as `immutable, max-age=31536000` (one year). Both are linked from every page with a version query string:

```html
<link rel="stylesheet" href="yusr.css?v=4" />
<script defer src="yusr.js?v=4"></script>
```

**Whenever you edit either file, bump `?v=N` to `?v=N+1` across all 11 HTML pages.** Skip this and returning visitors keep the old file for up to a year.

## Analytics & consent

Google Analytics 4 is wired through `yusr.js`, gated behind a cookie consent banner (built for GDPR/ePrivacy, not just Indian visitors): GA's script does not load at all until a visitor clicks Accept, defaults deny consent via Consent Mode v2, and Global Privacy Control is honoured automatically. See the `EVENT TRACKING` block near the bottom of `yusr.js` for how it's wired, and `privacy.html` for what it discloses.

The Measurement ID lives in exactly one place: `GA4_MEASUREMENT_ID` near the top of that block.

## Conventions

- **No hyphens or dashes in copy.** Rephrase instead of hyphenating ("7 day trial", not "7-day trial"); use commas or periods instead of em dashes. Applies to headings, body copy, and meta descriptions. Code comments are exempt.
- **No inline `style="..."` for anything about layout or type** (`grid-template-columns`, `font-size`, `flex`, etc). Every mobile bug found in this project so far traced back to an inline style that no media query could override. Use a class in `yusr.css`.
- **Structured data lives in `<script type="application/ld+json">` per page**, generated to match on-page copy exactly where possible (the FAQPage schema on `pricing.html` is built from the same `<details>` markup that renders on screen, not typed separately).

## Design system

Full color tokens, type scale, spacing, component conventions, and the responsive/accessibility notes from the last mobile audit live in `DESIGN.md`, kept alongside `PRODUCT.md` (strategy and brand voice) outside this repo, since everything committed here gets deployed and indexed by Cloudflare Pages.

## License

Proprietary. All rights reserved.
