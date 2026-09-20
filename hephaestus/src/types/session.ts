// Session-related shared types. The income API returns snake_case; we expose
// them as-is to the rest of the app and let the session store normalise
// field access.

export interface SessionInfo {
  owner_id: string
  display_name: string
  language?: 'en' | 'zh' | 'ja' | 'ko'
  given_name?: string
  middle_name?: string
  family_name?: string
  name?: {
    given_name?: string
    middle_name?: string
    family_name?: string
    givenName?: string
    middleName?: string
    familyName?: string
  }
  csrf_token: string
  expires_at: string
}
