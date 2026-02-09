# Digital Foundry Website

Marketing website for Digital Foundry, built with Tailwind CSS and Vite.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

- `index.html` - Home page
- `pages/` - All other site pages (Outcomes, Inside DF, Careers, Perspectives, AI, 404)
- `perspectives/` - Blog posts for the Perspectives section (11 articles)
- `partials/` - Reusable HTML components (navbar, footer, head)
- `src/` - CSS, JavaScript, and images
- `public/` - Static assets copied to dist (robots.txt)
- `dist/` - Production build output (auto-generated)

## Tech Stack

- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - No framework dependencies
- **Google Fonts** - PT Serif (headings) and Inter (body text)

## Development

The dev server runs on `http://localhost:5173` with hot module replacement. HTML partials are automatically included using `<!--include:filename.html-->` comments.

## Build Plugins

The production build (`npm run build`) runs three custom Vite plugins:

1. **HTML Includes** - Resolves `<!--include:filename.html-->` partials from the `partials/` directory
2. **SEO Validator** - Checks every indexable page for required SEO meta tags (description, canonical, Open Graph, Twitter Card). The build **fails** if any are missing, so SEO issues are caught before deploy.
3. **Sitemap Generator** - Auto-generates `dist/sitemap.xml` from all built HTML pages, excluding noindex pages (404). No manual sitemap maintenance needed.

## Adding a New Blog Post

1. Copy `perspectives/_template.html` to `perspectives/your-post-slug.html`
2. Replace all `REPLACE_` placeholders with real values
3. Write your article content in the `<!-- Content -->` section
4. Add a card for the new post on `pages/perspectives.html`
5. Run `npm run build` — the post is auto-discovered, SEO validated, and added to the sitemap

## Adding a New Page

1. Copy `pages/_template.html` to `pages/your-page-name.html`
2. Replace all `REPLACE_` placeholders with real values
3. Add your page content in the `<!-- Content -->` section
4. Optionally add a link in the navbar (`partials/navbar.html`)
5. Run `npm run build` — the page is auto-discovered, SEO validated, and added to the sitemap

No need to edit `vite.config.js` — HTML files are discovered automatically. Leaving any `REPLACE_` placeholder unchanged will cause the build to fail (the SEO validator catches it).

## Formatting

- **Prettier** enforces consistent code style
- `npm run format` — format all files
- `npm run format:check` — verify formatting without changes
- A **pre-commit hook** automatically formats staged files on every commit

## Deployment

Run `npm run build` to create an optimized production build in the `dist/` directory. Deploy the `dist/` folder to your hosting service.
