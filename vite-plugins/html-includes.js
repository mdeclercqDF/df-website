import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

/**
 * Custom Vite plugin that replaces <!--include:filename.html-->
 * markers with contents from the partials/ directory.
 */
export function htmlIncludesPlugin(rootDir) {
  return {
    name: 'html-includes',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!--\s*include:(\S+)\s*-->/g, (match, filename) => {
          const filePath = resolve(rootDir, 'partials', filename)
          if (existsSync(filePath)) {
            return readFileSync(filePath, 'utf-8')
          }
          console.warn(`[html-includes] Partial not found: ${filePath}`)
          return match
        })
      },
    },
  }
}
