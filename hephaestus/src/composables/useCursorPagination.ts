import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch, type ShallowRef } from 'vue'
import { errorMessage } from '@/utils/errors'
import { useIntersectionActivation } from './useIntersectionActivation'

export interface CursorPage<T> {
  items: T[]
  next_cursor: string
}

interface CursorPaginationOptions<T> {
  load: (cursor?: string) => Promise<CursorPage<T>>
  key: (item: T) => string
  preloadDistance?: number
}

/** Lazy, cursor-based pagination with stale-response and duplicate protection. */
export function useCursorPagination<T>(options: CursorPaginationOptions<T>) {
  const items = shallowRef<T[]>([]) as ShallowRef<T[]>
  const sentinel = ref<HTMLElement | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)
  const hasMore = ref(true)
  const nextCursor = ref('')
  let generation = 0
  let sentinelObserver: IntersectionObserver | null = null

  const visibility = useIntersectionActivation(() => { void loadMore() }, {
    rootMargin: `${options.preloadDistance ?? 160}px 0px`,
  })

  function sentinelIsNearViewport() {
    const node = sentinel.value
    if (!node || typeof window === 'undefined') return false
    const distance = options.preloadDistance ?? 160
    const bounds = node.getBoundingClientRect()
    return bounds.top <= window.innerHeight + distance && bounds.bottom >= -distance
  }

  async function loadMore() {
    if (!visibility.activated.value || loading.value || !hasMore.value) return
    const current = generation
    const cursor = nextCursor.value
    loading.value = true
    error.value = null
    let succeeded = false
    try {
      const page = await options.load(cursor || undefined)
      if (current !== generation) return
      if (page.next_cursor && page.next_cursor === cursor) {
        throw new Error('The server returned a repeated pagination cursor.')
      }
      const known = new Set(items.value.map(options.key))
      const additions = page.items.filter(item => {
        const key = options.key(item)
        if (known.has(key)) return false
        known.add(key)
        return true
      })
      items.value = [...items.value, ...additions]
      nextCursor.value = page.next_cursor || ''
      hasMore.value = Boolean(page.next_cursor)
      loaded.value = true
      succeeded = true
    } catch (cause) {
      if (current === generation) error.value = errorMessage(cause)
    } finally {
      if (current === generation) loading.value = false
    }
    if (succeeded && hasMore.value) {
      await nextTick()
      if (current === generation && sentinelIsNearViewport()) void loadMore()
    }
  }

  function reset() {
    generation++
    loading.value = false
    items.value = []
    nextCursor.value = ''
    hasMore.value = true
    loaded.value = false
    error.value = null
    if (visibility.activated.value) void loadMore()
  }

  function observeSentinel(node: HTMLElement | null) {
    sentinelObserver?.disconnect()
    sentinelObserver = null
    if (!node || typeof IntersectionObserver === 'undefined') return
    sentinelObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) void loadMore()
    }, { rootMargin: `${options.preloadDistance ?? 160}px 0px`, threshold: 0.01 })
    sentinelObserver.observe(node)
  }

  const stop = watch(sentinel, observeSentinel, { flush: 'post' })
  onMounted(() => observeSentinel(sentinel.value))
  onBeforeUnmount(() => {
    generation++
    stop()
    sentinelObserver?.disconnect()
  })

  return {
    section: visibility.target,
    activated: visibility.activated,
    sentinel,
    items,
    loading,
    error,
    loaded,
    hasMore,
    loadMore,
    reset,
    retry: loadMore,
  }
}
