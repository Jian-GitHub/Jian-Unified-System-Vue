/** Cross-application URL. Override when Hephaestus is served on another origin. */
export function hephaestusUrl(path = '/dashboard'): string {
  const configured = String(import.meta.env.VITE_HEPHAESTUS_URL || '').trim()
  const base = configured || `${window.location.protocol}//${window.location.hostname}:15173`
  return new URL(path, base.endsWith('/') ? base : `${base}/`).href
}
