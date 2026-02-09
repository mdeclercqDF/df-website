/**
 * Mobile Menu Toggle
 */
const initMobileMenu = () => {
  const menuButton = document.getElementById('mobile-menu-button')
  const mobileMenu = document.getElementById('mobile-menu')

  if (!menuButton || !mobileMenu) {
    console.warn('Mobile menu elements not found')
    return
  }

  menuButton.addEventListener('click', () => {
    try {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true'
      menuButton.setAttribute('aria-expanded', String(!isExpanded))
      mobileMenu.classList.toggle('hidden')
    } catch (error) {
      console.error('Error toggling mobile menu:', error)
    }
  })
}

/**
 * Active Nav Highlight
 * Highlights the current page's nav link based on pathname
 */
const initActiveNav = () => {
  try {
    const path = window.location.pathname
    const page = path.split('/').pop()?.replace('.html', '') || 'index'

    // Match page name to data-nav attribute (e.g., "outcomes.html" -> "outcomes")
    // Also handle blog posts under perspectives/
    const navKey = path.includes('/perspectives/') ? 'perspectives' : page === 'index' ? null : page

    if (navKey) {
      document.querySelectorAll(`[data-nav="${navKey}"]`).forEach((link) => {
        link.classList.add('text-df-dark', 'border-b-2', 'border-df-dark', 'pb-1')
      })
    }
  } catch (error) {
    console.error('Error initializing active nav:', error)
  }
}

/**
 * Store observers for cleanup
 * @type {IntersectionObserver[]}
 */
const observers = []

/**
 * Lazy Load Background Images
 * Uses Intersection Observer to load bridge parallax backgrounds only when visible
 */
const initLazyBackgrounds = () => {
  const lazyBackgrounds = document.querySelectorAll('.bridge-parallax')
  if (!lazyBackgrounds.length) return

  // Check for IntersectionObserver support
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers: load immediately
    lazyBackgrounds.forEach((bg) => bg.classList.add('bg-loaded'))
    return
  }

  try {
    const bgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bg-loaded')
            bgObserver.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '200px' }, // Start loading 200px before entering viewport
    )

    observers.push(bgObserver)
    lazyBackgrounds.forEach((bg) => bgObserver.observe(bg))
  } catch (error) {
    console.error('Error initializing lazy backgrounds:', error)
  }
}

/**
 * Cleanup all observers on page unload
 */
const cleanupObservers = () => {
  observers.forEach((obs) => obs.disconnect())
  observers.length = 0
}

/**
 * Initialize all functions when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu()
  initActiveNav()
  initLazyBackgrounds()
})

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', cleanupObservers)
