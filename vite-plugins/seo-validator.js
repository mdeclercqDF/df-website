import { readFileSync } from 'fs'
import { resolve, relative as pathRelative } from 'path'

/**
 * Vite plugin that validates SEO requirements on every built HTML page.
 * Fails the build if any indexable page is missing required meta tags.
 *
 * Required tags (unless the page has <meta name="robots" content="noindex...">):
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - <meta property="og:title">
 *   - <meta property="og:description">
 *   - <meta property="og:image">
 *   - <meta name="twitter:card">
 */
export function seoValidatorPlugin(findHtmlFiles, rootDir) {
  const requiredTags = [
    { name: 'meta description', pattern: /<meta\s[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i },
    { name: 'canonical URL', pattern: /<link\s[^>]*rel=["']canonical["'][^>]*href=["'][^"']+["'][^>]*>/i },
    { name: 'og:title', pattern: /<meta\s[^>]*property=["']og:title["'][^>]*>/i },
    { name: 'og:description', pattern: /<meta\s[^>]*property=["']og:description["'][^>]*>/i },
    { name: 'og:image', pattern: /<meta\s[^>]*property=["']og:image["'][^>]*>/i },
    { name: 'twitter:card', pattern: /<meta\s[^>]*name=["']twitter:card["'][^>]*>/i },
  ]

  const noindexPattern = /<meta\s[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/i

  return {
    name: 'seo-validator',
    enforce: 'post',
    closeBundle() {
      const distDir = resolve(rootDir, 'dist')
      const htmlFiles = findHtmlFiles(distDir)
      const errors = []

      for (const filePath of htmlFiles) {
        const html = readFileSync(filePath, 'utf-8')
        const relPath = pathRelative(distDir, filePath)

        // Skip noindex pages (e.g. 404)
        if (noindexPattern.test(html)) continue

        for (const tag of requiredTags) {
          if (!tag.pattern.test(html)) {
            errors.push(`  ${relPath}: missing ${tag.name}`)
          }
        }
      }

      if (errors.length > 0) {
        const msg = `\n[seo-validator] Build failed — ${errors.length} SEO issue(s) found:\n${errors.join('\n')}\n`
        throw new Error(msg)
      }

      console.log(`\n✅ [seo-validator] All ${htmlFiles.length} pages passed SEO checks.\n`)
    },
  }
}
