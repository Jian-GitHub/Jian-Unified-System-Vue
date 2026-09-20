import axios from 'axios'

export type ApiErrorKey = 'invalid_request' | 'invalid_credentials' | 'access_denied' | 'not_found' | 'conflict' | 'service_unavailable'

export function apiErrorKey(error: unknown): ApiErrorKey {
    if (!axios.isAxiosError(error)) return 'service_unavailable'
    switch (error.response?.status) {
        case 400: return 'invalid_request'
        case 401: return 'invalid_credentials'
        case 403: return 'access_denied'
        case 404: return 'not_found'
        case 409: return 'conflict'
        default: return 'service_unavailable'
    }
}
