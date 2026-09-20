// Keep only a short-lived, same-app authorization route across all login methods.
const key = 'apollo.pending-authorization.v1'
export function rememberAuthorization(path: string) {
  sessionStorage.setItem(key, JSON.stringify({ path, expires: Date.now() + 5 * 60_000 }))
}
export function pendingAuthorization(): string | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || 'null')
    if (value?.expires > Date.now() && typeof value.path === 'string' && value.path.startsWith('/authorize?')) return value.path
  } catch { /* expired or invalid browser state */ }
  clearAuthorization()
  return null
}
export function clearAuthorization() { sessionStorage.removeItem(key) }
