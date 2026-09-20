import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

interface IntersectionActivationOptions {
  target?: Ref<HTMLElement | null>
  rootMargin?: string
}

/** Activates a section once, shortly before it enters the viewport. */
export function useIntersectionActivation(
  callback: () => void,
  options: IntersectionActivationOptions = {},
) {
  const target = options.target ?? ref<HTMLElement | null>(null)
  const activated = ref(false)
  let observer: IntersectionObserver | null = null

  function activate() {
    if (activated.value) return
    activated.value = true
    observer?.disconnect()
    callback()
  }

  function observe(node: HTMLElement | null) {
    observer?.disconnect()
    observer = null
    if (!node || activated.value) return
    if (typeof IntersectionObserver === 'undefined') {
      activate()
      return
    }
    observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) activate()
    }, { rootMargin: options.rootMargin ?? '160px 0px', threshold: 0.01 })
    observer.observe(node)
  }

  const stop = watch(target, observe, { flush: 'post' })
  onMounted(() => observe(target.value))
  onBeforeUnmount(() => {
    stop()
    observer?.disconnect()
  })

  return { target, activated, activate }
}
