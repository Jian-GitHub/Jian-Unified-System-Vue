// Hephaestus only reads and closes its backend session. Authentication belongs to Apollo.

import axios from 'axios'
import instance from '@/api/axiosInstance'
import type { SessionInfo } from '@/types/session'

export async function fetchSession(): Promise<SessionInfo | null> {
  try {
    const { data } = await instance.get<SessionInfo>('/v1/session')
    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null
    }
    throw err
  }
}

export async function logout(): Promise<void> {
  try {
    await instance.delete('/v1/session')
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) return
    throw err
  }
}

export function isNetworkError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response
}

export function statusOf(err: unknown): number | null {
  if (axios.isAxiosError(err)) return err.response?.status ?? null
  return null
}
