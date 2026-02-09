import { readFileSync, existsSync, writeFileSync, statSync } from 'fs'
import { resolve, relative as pathRelative } from 'path'

/**
 * Escape special XML characters to prevent sitemap corruption
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Vite plugin that auto-generates sitemap.xml from the built HTML files.
 * Runs after each production build, so new pages are never forgotten.
 *
 * - Excludes noindex pages (e.g. 404)
 * - Homepage gets priority 1.0
 * - Section pages (pages/) get 0.8
 * - Blog posts (perspectives/) get 0.6
 * - Uses each file's source mtime for <lastmod>
 */
export function sitemapGeneratorPlugin(siteUrl, findHtmlFiles, rootDir) {
  return {
    name: 'sitemap-generator',
    enforce: 'post',
    closeBundle() {
      const distDir = resolve(rootDir, 'dist')
      const htmlFiles = findHtmlFiles(distDir)
      const entries = []

      for (const filePath of htmlFiles) {
        const html = readFileSync(filePath, 'utf-8')

        // Skip noindex pages
        if (/<meta\s[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/i.test(html)) {
          continue
        }

        const relPath = pathRelative(distDir, filePath).replace(/\\/g, '/')
        const url = relPath === 'index.html' ? '/' : `/${relPath}`

        // Determine priority and changefreq by path
        let priority, changefreq
        if (url === '/') {
          priority = '1.0'
          changefreq = 'monthly'
        } else if (url.startsWith('/perspectives/')) {
          priority = '0.6'
          changefreq = 'yearly'
        } else {
          priority = '0.8'
          changefreq = 'monthly'
        }

        // Use source file mtime for lastmod
        const sourcePath = resolve(rootDir, relPath)
        const mtime = existsSync(sourcePath) ? statSync(sourcePath).mtime : statSync(filePath).mtime
        const lastmod = mtime.toISOString().split('T')[0]

        entries.push({ url, lastmod, changefreq, priority })
      }

      // Sort: homepage first, then pages, then perspectives
      entries.sort((a, b) => {
        if (a.url === '/') return -1
        if (b.url === '/') return 1
        return a.url.localeCompare(b.url)
      })

      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries.map((e) =>
          [
            '  <url>',
            `    <loc>${escapeXml(siteUrl)}${escapeXml(e.url)}</loc>`,
            `    <lastmod>${e.lastmod}</lastmod>`,
            `    <changefreq>${e.changefreq}</changefreq>`,
            `    <priority>${e.priority}</priority>`,
            '  </url>',
          ].join('\n'),
        ),
        '</urlset>',
        '',
      ].join('\n')

      writeFileSync(resolve(distDir, 'sitemap.xml'), xml)
      console.log(`✅ [sitemap-generator] Generated sitemap.xml with ${entries.length} URLs.\n`)
    },
  }
}
