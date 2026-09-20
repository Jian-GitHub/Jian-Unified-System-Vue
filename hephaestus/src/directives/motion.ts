import type { Directive, DirectiveBinding } from 'vue'

interface SpotlightHandlers {
  move: (event: PointerEvent) => void
  leave: () => void
}

const spotlightHandlers = new WeakMap<HTMLElement, SpotlightHandlers>()
const revealObservers = new WeakMap<HTMLElement, IntersectionObserver>()

export const vSpotlight: Directive<HTMLElement> = {
  mounted(element) {
    element.classList.add('heph-spotlight')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return
      const bounds = element.getBoundingClientRect()
      element.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`)
      element.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`)
      element.classList.add('is-spotlight-active')
    }
    const leave = () => element.classList.remove('is-spotlight-active')
    element.addEventListener('pointermove', move, { passive: true })
    element.addEventListener('pointerleave', leave, { passive: true })
    spotlightHandlers.set(element, { move, leave })
  },
  unmounted(element) {
    const handlers = spotlightHandlers.get(element)
    if (!handlers) return
    element.removeEventListener('pointermove', handlers.move)
    element.removeEventListener('pointerleave', handlers.leave)
    spotlightHandlers.delete(element)
  },
}

interface RevealOptions {
  delay?: number
  distance?: number
}

function revealOptions(binding: DirectiveBinding<RevealOptions | number | undefined>): RevealOptions {
  return typeof binding.value === 'number' ? { delay: binding.value } : binding.value ?? {}
}

export const vReveal: Directive<HTMLElement, RevealOptions | number | undefined> = {
  mounted(element, binding) {
    const options = revealOptions(binding)
    element.classList.add('heph-reveal')
    element.style.setProperty('--reveal-delay', `${Math.max(0, options.delay ?? 0)}ms`)
    element.style.setProperty('--reveal-distance', `${Math.max(0, options.distance ?? 12)}px`)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      element.classList.add('is-revealed')
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return
      element.classList.add('is-revealed')
      observer.disconnect()
      revealObservers.delete(element)
    }, { rootMargin: '80px 0px', threshold: 0.08 })
    observer.observe(element)
    revealObservers.set(element, observer)
  },
  unmounted(element) {
    revealObservers.get(element)?.disconnect()
    revealObservers.delete(element)
  },
}
