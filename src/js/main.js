/**
 * Mobile Menu Toggle
 */
const initMobileMenu = () => {
  const menuButton = document.getElementById('mobile-menu-button')
  const closeButton = document.getElementById('mobile-menu-close')
  const mobileMenu = document.getElementById('mobile-menu')

  if (!menuButton || !mobileMenu) {
    console.warn('Mobile menu elements not found')
    return
  }

  const openMenu = () => {
    menuButton.setAttribute('aria-expanded', 'true')
    mobileMenu.classList.remove('hidden')
    mobileMenu.classList.add('flex')
    document.body.style.overflow = 'hidden'
  }

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false')
    mobileMenu.classList.add('hidden')
    mobileMenu.classList.remove('flex')
    document.body.style.overflow = ''
  }

  menuButton.addEventListener('click', openMenu)
  if (closeButton) closeButton.addEventListener('click', closeMenu)

  // Close when a nav link is tapped
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu)
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
 * Mobile parallax: JS-based background-position since background-attachment:fixed doesn't work on iOS
 */
const initMobileParallax = () => {
  if (!window.matchMedia('(max-width: 767px)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let ticking = false

  const updateParallax = () => {
    const parallaxEls = document.querySelectorAll('.bridge-parallax.bg-loaded')
    if (!parallaxEls.length) return
    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const elHeight = rect.height
      // How far the element is through the viewport: 0 = just entering bottom, 1 = just leaving top
      const progress = 1 - (rect.top + elHeight) / (window.innerHeight + elHeight)
      // Background is 160% of container height, so 30% extra per side
      const maxShift = elHeight * 0.55
      // Map progress [0,1] to shift [-maxShift, +maxShift]
      const shift = (progress - 0.5) * 2 * maxShift
      el.style.backgroundPosition = `center calc(50% + ${shift}px)`
    })
    ticking = false
  }

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax)
      ticking = true
    }
  }

  updateParallax()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)

  // Run when lazy loader adds bg-loaded (e.g. first parallax visible on load)
  const mo = new MutationObserver(updateParallax)
  document.querySelectorAll('.bridge-parallax').forEach((el) => {
    mo.observe(el, { attributes: true, attributeFilter: ['class'] })
  })

  const cleanup = () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    mo.disconnect()
    document.querySelectorAll('.bridge-parallax').forEach((el) => (el.style.backgroundPosition = ''))
  }
  window.addEventListener('beforeunload', cleanup)
}

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

    lazyBackgrounds.forEach((bg) => bgObserver.observe(bg))
  } catch (error) {
    console.error('Error initializing lazy backgrounds:', error)
  }
}

/**
 * Fade-up scroll animation for content inside sections (not entire sections)
 * Parallax images get fade-in only (no translate)
 *
 * Walks the DOM inside each .section-container to find the right animation
 * targets regardless of nesting depth. The rules:
 *   - Cards (.df-card, .challenge-card) → animate individually
 *   - Buttons (.btn-primary) → animate individually
 *   - Grids (.grid) → animate each direct child individually
 *   - Stacked layouts (.space-y-*) → animate each direct child individually
 *   - Leaf elements (h1-h4, p, blockquote, img) → animate individually
 *   - Wrapper divs / links → recurse into children
 */
const initScrollAnimations = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const main = document.querySelector('main')
  if (!main) return

  const contentTargets = []
  const walkForTargets = (el) => {
    for (const child of el.children) {
      if (child.classList.contains('df-card') || child.classList.contains('challenge-card')) {
        contentTargets.push(child)
        continue
      }
      if (child.classList.contains('btn-primary')) {
        contentTargets.push(child)
        continue
      }
      if (child.classList.contains('grid')) {
        for (const item of child.children) contentTargets.push(item)
        continue
      }
      if ([...child.classList].some((c) => /^space-y-/.test(c))) {
        for (const item of child.children) contentTargets.push(item)
        continue
      }
      if (['H1', 'H2', 'H3', 'H4', 'P', 'BLOCKQUOTE', 'IMG'].includes(child.tagName)) {
        contentTargets.push(child)
        continue
      }
      if (child.tagName === 'DIV' || child.tagName === 'A') {
        walkForTargets(child)
        continue
      }
      contentTargets.push(child)
    }
  }

  main.querySelectorAll('section .section-container').forEach((container) => walkForTargets(container))

  const parallaxTargets = main.querySelectorAll(':scope > .bridge-parallax')
  const allTargets = [...contentTargets, ...parallaxTargets]
  if (!allTargets.length) return

  if (!('IntersectionObserver' in window)) {
    contentTargets.forEach((el) => el.classList.add('aos-fade-up', 'aos-visible'))
    parallaxTargets.forEach((el) => el.classList.add('aos-fade-in', 'aos-visible'))
    return
  }

  try {
    contentTargets.forEach((el) => el.classList.add('aos-fade-up'))
    parallaxTargets.forEach((el) => el.classList.add('aos-fade-in'))

    const aosObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-visible')
            aosObserver.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0 },
    )

    allTargets.forEach((el) => aosObserver.observe(el))
  } catch (error) {
    console.error('Error initializing scroll animations:', error)
    contentTargets.forEach((el) => el.classList.add('aos-visible'))
    parallaxTargets.forEach((el) => el.classList.add('aos-visible'))
  }
}

/**
 * Initialize all functions when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu()
  initActiveNav()
  initLazyBackgrounds()
  initMobileParallax()
  initScrollAnimations()
})
