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
  adminMe: () => request<{ authenticated: boolean; minecraft: AuthMeResponse['user']['minecraft']; allowed: boolean; requiredMcid: string }>('/admin/me'),
  adminSearch: (query: string) => request<{ ok: boolean; players: RankingPlayer[]; teams: Team[] }>(`/admin/search?q=${encodeURIComponent(query)}`),
  adminNews: (payload: { title: string; category: string; excerpt: string; markdown: string; cover?: string }) => post<{ ok: boolean; post: NewsPost }>('/admin/news', payload),
  adminPoint: (payload: { uuid: string; amount: number; action: 'add' | 'remove'; reason: string }) => post<{ ok: boolean; result?: unknown; player?: RankingPlayer }>('/admin/point', payload),
  adminStartEvent: (payload: { type: string; message: string }) => post<{ ok: boolean; event: LiveEvent }>('/admin/event/start', payload),
  adminEndEvent: (payload: { eventId: string; message?: string }) => post<{ ok: boolean; event: LiveEvent }>('/admin/event/end', payload),
  adminBan: (payload: { target: string; reason: string; type: 'ban' | 'disqualify'; notifyDiscord: boolean }) => post<{ ok: boolean; ban: unknown }>('/admin/ban', payload),
  adminNotify: (payload: { title: string; message: string }) => post<{ ok: boolean; notification: LiveEvent }>('/admin/discord/notify', payload),
}
