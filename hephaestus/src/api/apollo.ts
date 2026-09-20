// The backend starts Apollo SSO and binds the callback to this browser.
export function redirectToApollo(from = '/dashboard') {
  const destination = new URL(from, window.location.origin)
  const safePath = destination.origin === window.location.origin && destination.pathname !== '/login'
    ? destination.pathname + destination.search + destination.hash : '/dashboard'
  const start = new URL('/api/v1/auth/start', window.location.origin)
  start.searchParams.set('return_to', safePath)
  window.location.assign(start.href)
}

/** Public Apollo account UI. Override for deployments that do not use the standard port. */
export function apolloAccountUrl(path = '/user'): string {
  const configured = String(import.meta.env.VITE_APOLLO_URL || '').trim()
  const base = configured || `${window.location.protocol}//${window.location.hostname}:20551`
  return new URL(path, base.endsWith('/') ? base : `${base}/`).href
}
