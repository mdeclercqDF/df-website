import { defineConfig } from 'vite'
import { readdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { htmlIncludesPlugin, seoValidatorPlugin, sitemapGeneratorPlugin } from './vite-plugins/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SITE_URL = 'https://digitalfoundry.com'

/** Shared image quality setting for all formats */
const IMAGE_QUALITY = 85

/** Recursively find all .html files in a directory. */
function findHtmlFiles(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(fullPath))
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath)
    }
  }
  return results
}

/**
 * Auto-discover HTML input files for Rollup.
 * Scans ./, pages/, and perspectives/ for *.html files.
 * Files prefixed with _ (e.g. _template.html) are excluded.
 */
function discoverHtmlInputs() {
  const inputs = {}
  const dirs = ['.', 'pages', 'perspectives']

  for (const dir of dirs) {
    const fullDir = resolve(__dirname, dir)
    if (!existsSync(fullDir)) continue

    for (const entry of readdirSync(fullDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.html') || entry.name.startsWith('_')) continue

      const relPath = dir === '.' ? entry.name : `${dir}/${entry.name}`
      const key = relPath === 'index.html' ? 'main' : relPath.replace(/\.html$/, '').replace(/\//g, '-')
      inputs[key] = `./${relPath}`
    }
  }

  return inputs
}

export default defineConfig({
  root: '.',
  base: '/df-website/',
  plugins: [
    htmlIncludesPlugin(__dirname),
    ViteImageOptimizer({
      test: /\.(webp|png|jpg|jpeg)$/i,
      exclude: /\.(svg)$/i,
      cache: true,
      cacheLocation: resolve(__dirname, 'node_modules/.cache/vite-plugin-image-optimizer'),
      webp: { quality: IMAGE_QUALITY, lossless: false },
      png: { quality: IMAGE_QUALITY },
      jpeg: { quality: IMAGE_QUALITY },
      disabled: process.env.NODE_ENV === 'development',
    }),
    seoValidatorPlugin(findHtmlFiles, __dirname),
    sitemapGeneratorPlugin(SITE_URL, findHtmlFiles, __dirname),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: discoverHtmlInputs(),
    },
  },
  server: {
    open: true,
  },
})
