import type { ObjectDirective } from 'vue'

type Axis = 'x' | 'y'
const disposers = new WeakMap<HTMLElement, () => void>()

/** One axis per trackpad burst or single-finger drag; ordinary page scrolling stays native. */
export const vAxisLockedScroll: ObjectDirective<HTMLElement> = {
  mounted(root) {
    const controller = new AbortController()
    const options = { capture: true, passive: false, signal: controller.signal }
    let wheelAxis: Axis | null = null
    let wheelTarget: HTMLElement | null = null
    let lastWheel = 0
    let touchAxis: Axis | null = null
    let touchTarget: HTMLElement | null = null
    let startX = 0, startY = 0, lastX = 0, lastY = 0
    let lastMove = 0, velocity = 0, frame = 0, suppressClickUntil = 0

    function viewport(target: EventTarget | null): HTMLElement | null {
      if (!(target instanceof Element)) return null
      const table = target.closest('.el-table')
      if (table) {
        // Leave form controls and scrollbar handles to their own interactions.
        if (target.closest('input, textarea, select, .el-select, .el-scrollbar__bar')) return null
        return table.querySelector<HTMLElement>('.el-table__body-wrapper .el-scrollbar__wrap')
      }
      return target.closest<HTMLElement>('.matrix-scroll')
    }

    function scroll(target: HTMLElement, axis: Axis, delta: number) {
      let remaining = delta
      let element: HTMLElement | null = target
      while (element && Math.abs(remaining) > 0.1) {
        const isPage = element === document.scrollingElement
        const css = getComputedStyle(element)
        const overflow = axis === 'x' ? css.overflowX : css.overflowY
        if (element === target || isPage || /auto|scroll/.test(overflow)) {
          const before = axis === 'x' ? element.scrollLeft : element.scrollTop
          if (axis === 'x') element.scrollLeft += remaining
          else element.scrollTop += remaining
          const after = axis === 'x' ? element.scrollLeft : element.scrollTop
          remaining -= after - before
        }
        // Horizontal gestures never turn into vertical page scroll at the edge.
        if (axis === 'x' || isPage) break
        element = element.parentElement
      }
      return delta - remaining
    }

    root.addEventListener('wheel', event => {
      if (event.ctrlKey || !event.cancelable) return // Preserve trackpad pinch zoom.
      const target = viewport(event.target)
      if (!target) { wheelAxis = null; return }
      const now = performance.now()
      const dx = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX
      const dy = event.shiftKey && !event.deltaX ? 0 : event.deltaY
      if (!dx && !dy) return
      cancelAnimationFrame(frame)
      if (now - lastWheel > 180 || wheelTarget !== target || !wheelAxis) {
        wheelAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        wheelTarget = target
      }
      lastWheel = now
      event.preventDefault()
      event.stopPropagation() // Element Plus also handles wheel deltas.
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? target.clientHeight : 1
      scroll(target, wheelAxis, (wheelAxis === 'x' ? dx : dy) * unit)
    }, options)

    root.addEventListener('touchstart', event => {
      cancelAnimationFrame(frame)
      touchAxis = null
      velocity = 0
      touchTarget = event.touches.length === 1 ? viewport(event.target) : null
      if (!touchTarget) return
      const touch = event.touches[0]
      startX = lastX = touch.clientX
      startY = lastY = touch.clientY
      lastMove = performance.now()
    }, options)

    root.addEventListener('touchmove', event => {
      if (event.touches.length !== 1) { touchTarget = null; return }
      if (!touchTarget || !event.cancelable) return
      const touch = event.touches[0]
      const dx = startX - touch.clientX, dy = startY - touch.clientY
      if (!touchAxis && Math.max(Math.abs(dx), Math.abs(dy)) >= 6) {
        touchAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }
      if (!touchAxis) return
      event.preventDefault()
      const now = performance.now()
      const delta = touchAxis === 'x' ? lastX - touch.clientX : lastY - touch.clientY
      scroll(touchTarget, touchAxis, delta)
      velocity = delta / Math.max(8, now - lastMove)
      lastMove = now
      lastX = touch.clientX
      lastY = touch.clientY
      suppressClickUntil = now + 400
    }, options)

    root.addEventListener('touchend', event => {
      const target = touchTarget, axis = touchAxis
      touchTarget = null
      if (event.touches.length || !target || !axis || performance.now() - lastMove > 80) return
      let previous = performance.now()
      const glide = (now: number) => {
        const elapsed = Math.min(32, now - previous)
        previous = now
        const moved = scroll(target, axis, velocity * elapsed)
        velocity *= Math.exp(-elapsed / 150)
        if (target.isConnected && Math.abs(velocity) > 0.02 && Math.abs(moved) > 0.1) {
          frame = requestAnimationFrame(glide)
        }
      }
      frame = requestAnimationFrame(glide)
    }, options)
    root.addEventListener('touchcancel', () => {
      touchTarget = null
      cancelAnimationFrame(frame)
    }, options)
    root.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil && viewport(event.target)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }, { capture: true, signal: controller.signal })
    disposers.set(root, () => { controller.abort(); cancelAnimationFrame(frame) })
  },
  beforeUnmount(root) {
    disposers.get(root)?.()
    disposers.delete(root)
  },
}
