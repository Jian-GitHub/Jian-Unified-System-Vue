// Shared axios instances. The Income API uses HttpOnly session cookies and
// expects the CSRF token on every state-changing request, plus an
// Idempotency-Key on POST commands. We read the token from a Pinia session
// store at request time so log-in / log-out keep working after navigation.

import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { useSessionStore } from '@/store/session'
import { makeIdempotencyKey } from '@/utils/format'
import { errorMessage } from '@/utils/errors'

const instance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
})

// Mutable flag: the global Pinia store sets this in main.ts so the
// interceptors don't have to call useStore() at module-load time.
let _storeAccessor: () => ReturnType<typeof useSessionStore> = () => useSessionStore()

export function bindSessionAccessor(fn: () => ReturnType<typeof useSessionStore>) {
  _storeAccessor = fn
}

let onAccessError: (status: number) => void = () => {}
export function bindAccessErrorHandler(handler: (status: number) => void) { onAccessError = handler }

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])

instance.interceptors.request.use((config) => {
  const session = _storeAccessor()
  if (session.csrfToken) {
    config.headers['X-CSRF-Token'] = session.csrfToken
  }
  if (MUTATING_METHODS.has((config.method ?? 'get').toLowerCase())) {
    const headers = (config.headers ?? {}) as Record<string, string>
    if (!headers['Idempotency-Key']) {
      headers['Idempotency-Key'] = makeIdempotencyKey()
      config.headers = headers as typeof config.headers
    }
  }
  return config
})

instance.interceptors.response.use(
  (response) => {
    const etag = response.headers['etag']
    if (etag && response.config.method?.toLowerCase() !== 'head') {
      // Cache the latest ETag per resource so PATCH / state calls can attach If-Match.
      const session = _storeAccessor()
      session.rememberEtag(response.config.url ?? '', etag)
    }
    return response
  },
  (error: AxiosError) => {
    error.message = errorMessage(error)
    const status = error.response?.status
    if (status === 401 || status === 403) {
      _storeAccessor().clear()
      if (error.config?.url !== '/v1/session') onAccessError(status)
    }
    return Promise.reject(error)
  },
)

export function attachIfMatch<T extends AxiosRequestConfig>(config: T, etag?: string): T {
  if (etag) {
    // Resource JSON carries a bare version; HTTP ETag already includes quotes.
    // Keep the version as text to preserve int64 precision.
    const value = etag.trim()
    const ifMatch = /^\d+$/.test(value) ? `"${value}"` : value
    config.headers = { ...(config.headers ?? {}), 'If-Match': ifMatch }
  }
  return config
}

export default instance
