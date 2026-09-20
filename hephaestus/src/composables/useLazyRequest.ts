import { onBeforeUnmount, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { errorMessage } from '@/utils/errors'
import { useIntersectionActivation } from './useIntersectionActivation'

interface LazyRequestOptions {
  target?: Ref<HTMLElement | null>
  rootMargin?: string
}

/** Keeps only the latest response and defers the first request until visible. */
export function useLazyRequest<T>(
  request: () => Promise<T>,
  options: LazyRequestOptions = {},
) {
  const data = shallowRef<T | null>(null) as ShallowRef<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)
  let generation = 0

  async function execute() {
    const current = ++generation
    loading.value = true
    error.value = null
    try {
      const result = await request()
      if (current !== generation) return
      data.value = result
      loaded.value = true
    } catch (cause) {
      if (current === generation) error.value = errorMessage(cause)
    } finally {
      if (current === generation) loading.value = false
    }
  }

  const visibility = useIntersectionActivation(() => { void execute() }, options)
  onBeforeUnmount(() => { generation++ })

  function reload() {
    if (visibility.activated.value) void execute()
  }

  return {
    ...visibility,
    data,
    loading,
    error,
    loaded,
    reload,
    retry: reload,
  }
}
