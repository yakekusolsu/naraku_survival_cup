import type { ApiEndpoint, AuthMeResponse, LiveEvent, MapMarker, NewsPost, RankingPlayer, ShopItem, Team, TournamentOverview } from '@/types'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`)
  }
  return (await response.json()) as T
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`)
  }
  return (await response.json()) as T
}

export const nscApi = {
  overview: () => request<TournamentOverview>('/overview'),
  ranking: () => request<RankingPlayer[]>('/ranking'),
  players: () => request<RankingPlayer[]>('/players'),
  teams: () => request<Team[]>('/teams'),
  news: () => request<NewsPost[]>('/news'),
  schedule: () => request('/schedule'),
  map: () => request<MapMarker[]>('/map'),
  shop: () => request<ShopItem[]>('/shop'),
  events: () => request<LiveEvent[]>('/event'),
  apiDocs: () => request<ApiEndpoint[]>('/api-docs'),
  authMe: () => request<AuthMeResponse>('/auth/me'),
  linkMinecraft: (payload: { minecraftName: string; edition: 'java' | 'bedrock' | 'floodgate' }) => post<AuthMeResponse>('/auth/minecraft/link', payload),
  unlinkMinecraft: () => post<AuthMeResponse>('/auth/minecraft/unlink'),
}
