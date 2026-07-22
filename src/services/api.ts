import type { ApiEndpoint, AuthMeResponse, LiveEvent, MapMarker, NewsPost, RankingPlayer, ShopItem, ShopPurchaseResponse, Team, TournamentOverview } from '@/types'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(await errorMessage(response, path))
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
    throw new Error(await errorMessage(response, path))
  }
  return (await response.json()) as T
}

async function errorMessage(response: Response, path: string) {
  try {
    const body = (await response.json()) as { error?: string }
    return `API request failed: ${response.status} ${path} ${body.error ?? ''}`.trim()
  } catch {
    return `API request failed: ${response.status} ${path}`
  }
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
  purchaseShop: (payload: { itemId: string; targetId?: string }) => post<ShopPurchaseResponse>('/shop/purchase', payload),
  events: () => request<LiveEvent[]>('/event'),
  apiDocs: () => request<ApiEndpoint[]>('/api-docs'),
  authMe: () => request<AuthMeResponse>('/auth/me'),
  linkMinecraft: (payload: { minecraftName: string; edition: 'java' | 'bedrock' | 'floodgate' }) => post<AuthMeResponse>('/auth/minecraft/link', payload),
  unlinkMinecraft: () => post<AuthMeResponse>('/auth/minecraft/unlink'),
  logout: () => post<{ ok: boolean }>('/auth/logout'),
}
