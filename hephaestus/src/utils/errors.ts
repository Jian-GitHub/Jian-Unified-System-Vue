import { i18n } from '@/i18n'

export function errorMessage(error: unknown, fallback = i18n.global.t('ui.requestFailed')): string {
  const e = error as { response?: { data?: unknown }; message?: unknown }
  const body = e?.response?.data
  if (typeof body === 'string' && body.trim() && !body.trim().startsWith('<')) return body
  if (body && typeof body === 'object') {
    const data = body as { message?: unknown; error?: unknown }
    if (typeof data.message === 'string' && data.message) return data.message
    if (typeof data.error === 'string' && data.error) return data.error
  }
  return typeof e?.message === 'string' && e.message ? e.message : fallback
}
