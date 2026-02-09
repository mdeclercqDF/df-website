# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the DF marketing website built with vanilla HTML/CSS and Tailwind CSS. It's a code-only site (no CMS) optimized for fast development and deployment.

## Directory Structure

```
DF-website/
├── index.html              # Home page (main entry point)
├── pages/                  # Site pages
│   ├── _template.html     # Template for new pages (excluded from build)
│   ├── outcomes.html
│   ├── inside-df.html
│   ├── careers.html
│   ├── perspectives.html
│   ├── ai.html
│   └── 404.html
├── perspectives/           # Blog posts (Perspectives section)
│   ├── _template.html     # Template for new blog posts (excluded from build)
│   ├── sample-post.html
│   ├── how-mcp-can-bring-ai-closer-to-real-enterprise-work.html
│   ├── the-semantic-layer-of-scale.html
│   ├── designing-for-digital-differentiation.html
│   ├── ai-as-a-system-component-not-a-shortcut.html
│   ├── the-double-edged-sword-of-institutional-knowledge.html
│   ├── the-hidden-costs-of-going-faster.html
│   ├── ai-readiness-isnt-about-the-model.html
│   ├── accelerating-post-merger-value-creation.html
│   ├── the-platform-bet.html
│   └── no-silver-bullets-in-ai-yet.html
├── partials/               # Reusable HTML components (navbar, footer, etc.)
├── src/
│   ├── styles/
│   │   └── main.css       # Tailwind imports and custom CSS
│   ├── js/
│   │   └── main.js        # Navigation, mobile menu, smooth scroll
│   └── assets/
│       └── images/        # Image assets
├── public/                # Static assets (copied as-is to dist; robots.txt lives here)
├── dist/                  # Build output (gitignored)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Development Setup

### Prerequisites

- Node.js (v18 or higher recommended)

### Installation

```bash
npm install
```

### Development Commands

- `npm run dev` - Start Vite dev server with hot reload (opens at http://localhost:5173)
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check formatting without writing changes

## Architecture

### Build System

- **Vite** - Fast dev server with hot module replacement and optimized production builds
- **PostCSS** - CSS processing with Tailwind and Autoprefixer
- **Auto-discovery** - HTML files in `./`, `pages/`, and `perspectives/` are automatically included as Rollup inputs. No need to edit `vite.config.js` when adding pages. Files prefixed with `_` (e.g. `_template.html`) are excluded.
- **Custom Vite plugins** (defined in `vite.config.js`):
  - `htmlIncludesPlugin` - Resolves `<!--include:filename.html-->` partials
  - `seoValidatorPlugin` - Fails the build if any indexable page is missing required SEO meta tags (description, canonical, OG, Twitter Card). Pages with `noindex` robots meta are skipped.
  - `sitemapGeneratorPlugin` - Auto-generates `dist/sitemap.xml` from built HTML files. No static sitemap to maintain — new pages are included automatically.

### Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Typography**:
  - Headings: PT Serif (Google Fonts)
  - Body text: Inter (Google Fonts)
- Custom styles in `src/styles/main.css` using Tailwind's `@layer` directive

### JavaScript

- Vanilla JavaScript in `src/js/main.js`
- Features:
  - Mobile menu toggle
  - Active navigation state highlighting

### Contact

- Contact section uses a simple `mailto:` link
- Can be upgraded to a form with backend integration in the future

### Static Assets

- Place static files (images, fonts, etc.) in `public/` directory
- These files are copied as-is to `dist/` during build
- Reference them in HTML with absolute paths (e.g., `/logo.png`)

## SEO

Every indexable page must include the following tags in `<head>` **above** the `<!--include:head.html-->` line:

- `<meta name="description">` — unique, 150-160 char summary
- `<link rel="canonical" href="https://digitalfoundry.com/...">` — full canonical URL
- Open Graph: `og:title`, `og:description`, `og:url`, `og:type`, `og:image`, `og:site_name`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

For non-indexable pages (e.g. 404), add `<meta name="robots" content="noindex, nofollow">` instead.

The build will **fail** if any of these are missing — the `seoValidatorPlugin` enforces this automatically.

### How to Add a New Blog Post

1. Copy `perspectives/_template.html` to `perspectives/your-post-slug.html`
2. Replace all `REPLACE_` placeholders with real values (title, description, filename, image, category, author, dates)
3. Write your article content in the `<!-- Content -->` section
4. Add a card for the new post on `pages/perspectives.html` (copy an existing card and update the link, title, description, and category)
5. Run `npm run build` — the post is auto-discovered (no need to edit `vite.config.js`). The SEO validator will catch any missing or placeholder values, and the sitemap includes the new page automatically.

### How to Add a New Page

1. Copy `pages/_template.html` to `pages/your-page-name.html`
2. Replace all `REPLACE_` placeholders with real values (title, description, filename, subtitle, CTA heading/text)
3. Add your page content in the `<!-- Content -->` section
4. Optionally add a link in the navbar (`partials/navbar.html`)
5. Run `npm run build` — the page is auto-discovered (no need to edit `vite.config.js`). The SEO validator will catch any missing or placeholder values, and the sitemap includes the new page automatically.

### Structured data (JSON-LD)

- Homepage (`index.html`): Organization + WebSite schemas
- Perspectives listing (`pages/perspectives.html`): CollectionPage schema
- Each blog post (`perspectives/*.html`): Article schema

### Static SEO files

- `public/robots.txt` — manually maintained
- `dist/sitemap.xml` — auto-generated at build time (do NOT create `public/sitemap.xml`)

## Formatting

- **Prettier** enforces consistent code style across all files
- Run `npm run format` to format everything, or `npm run format:check` to verify
- A **pre-commit hook** (simple-git-hooks + lint-staged) automatically formats staged files on every commit — contributors never need to remember to run format manually
- Config: `.prettierrc` (semi: false, singleQuote: true, printWidth: 120)

## Development Notes

- Tailwind config scans all HTML files (`index.html`, `pages/`, `partials/`, `perspectives/`) and all files in `src/` for class names
- Vite automatically handles ES modules and hot reload
- All source files use ES module syntax (`import`/`export`)
- Partials are included using `<!--include:filename.html-->` comments (handled by custom Vite plugin)
- All page HTML files (except index.html) are organized in the `pages/` directory
- Navigation links in partials point to `/pages/` for proper routing
- Domain is `https://digitalfoundry.com` — used in canonical URLs, OG tags, and sitemap
- Template files (`_template.html`) in `pages/` and `perspectives/` use `REPLACE_` prefixed placeholders. Leaving any placeholder unchanged will cause the SEO validator to fail the build.
