import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import swaggerUi from 'swagger-ui-express'
import { readAuthSession, registerDiscordAuthRoutes } from './auth.js'
import { loadEnvFile } from './env.js'
import {
  apiEndpoints,
  events as mockEvents,
  mapMarkers as mockMapMarkers,
  news,
  overview,
  rankings as mockRankings,
  schedule,
  shop,
  teams as mockTeams,
} from '../src/data/mock.js'
import { openApiDocument } from './openapi.js'
import type { LiveEvent, RankingPlayer, ShopItem, Team } from '../src/types/index.js'

loadEnvFile()

const port = Number(process.env.PORT ?? 8787)
const demoData = process.env.DEMO_DATA === 'true'
const liveRankings = demoData ? mockRankings : []
const liveTeams = demoData ? mockTeams : []
const liveEvents = demoData ? mockEvents : []
const liveMapMarkers = demoData ? mockMapMarkers : []
const liveOverview = {
  ...overview,
  participants: demoData ? overview.participants : 0,
}
const pluginRestBaseUrl = process.env.PLUGIN_REST_BASE_URL?.replace(/\/+$/, '')
const pluginRestToken = process.env.PLUGIN_REST_TOKEN
const adminMcid = (process.env.ADMIN_MCID ?? 'yousotu_neet').trim().toLowerCase()
const app = express()
const server = createServer(app)
const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173'
const io = new Server(server, {
  cors: {
    origin: webOrigin,
    credentials: true,
  },
})

app.use(cors({ origin: webOrigin, credentials: true }))
app.use(express.json({ limit: '1mb' }))
registerDiscordAuthRoutes(app)

app.get('/api/overview', async (_request, response) => {
  if (!pluginRestConfigured()) {
    response.json(liveOverview)
    return
  }

  try {
    const players = await pluginRequest<PluginPlayersResponse>('/api/players?limit=500')
    response.json({ ...liveOverview, participants: players.items.length })
  } catch (error) {
    console.error('Plugin overview sync failed', error)
    response.status(502).json({ error: 'plugin_overview_unavailable' })
  }
})
app.get('/api/ranking', async (_request, response) => {
  if (!pluginRestConfigured()) {
    response.json(liveRankings)
    return
  }

  try {
    const ranking = await pluginRequest<PluginRankingResponse>('/api/ranking?type=points&limit=100')
    response.json(ranking.items.map(toWebRankingPlayer))
  } catch (error) {
    console.error('Plugin ranking sync failed', error)
    response.status(502).json({ error: 'plugin_ranking_unavailable' })
  }
})
app.get('/api/players', async (_request, response) => {
  if (!pluginRestConfigured()) {
    response.json(liveRankings)
    return
  }

  try {
    const players = await pluginRequest<PluginPlayersResponse>('/api/players?limit=100')
    response.json(players.items.map((player, index) => toWebPlayer(player, index + 1)))
  } catch (error) {
    console.error('Plugin players sync failed', error)
    response.status(502).json({ error: 'plugin_players_unavailable' })
  }
})
app.get('/api/player/:uuid', async (request, response) => {
  if (pluginRestConfigured()) {
    try {
      const player = await pluginRequest<PluginPlayer>(`/api/player/${encodeURIComponent(request.params.uuid)}`)
      response.json(toWebPlayer(player, player.seasonRank ?? undefined))
      return
    } catch (error) {
      console.error('Plugin player sync failed', error)
      response.status(404).json({ error: 'player_not_found' })
      return
    }
  }

  const player = liveRankings.find((entry) => entry.uuid === request.params.uuid || entry.name.toLowerCase() === request.params.uuid.toLowerCase())
  response.status(player ? 200 : 404).json(player ?? { error: 'player_not_found' })
})
app.get('/api/teams', async (_request, response) => {
  if (!pluginRestConfigured()) {
    response.json(liveTeams)
    return
  }

  try {
    const teams = await pluginRequest<PluginTeamsResponse>('/api/teams?limit=100')
    response.json(teams.items.map((team, index) => toWebTeam(team, index + 1)))
  } catch (error) {
    console.error('Plugin teams sync failed', error)
    response.status(502).json({ error: 'plugin_teams_unavailable' })
  }
})
app.get('/api/team/:id', async (request, response) => {
  if (pluginRestConfigured()) {
    try {
      const team = await pluginRequest<PluginTeam>(`/api/team/${encodeURIComponent(request.params.id)}`)
      response.json(toWebTeam(team, 1))
      return
    } catch (error) {
      console.error('Plugin team sync failed', error)
      response.status(404).json({ error: 'team_not_found' })
      return
    }
  }

  const team = liveTeams.find((entry) => entry.id === request.params.id)
  response.status(team ? 200 : 404).json(team ?? { error: 'team_not_found' })
})
app.get('/api/news', (_request, response) => response.json(news))
app.get(['/api/event', '/api/events'], async (_request, response) => {
  if (!pluginRestConfigured()) {
    response.json(liveEvents)
    return
  }

  try {
    const events = await pluginRequest<PluginEventsResponse>('/api/events?limit=100')
    response.json(events.items.map(toWebEvent))
  } catch (error) {
    console.error('Plugin events sync failed', error)
    response.status(502).json({ error: 'plugin_events_unavailable' })
  }
})
app.get('/api/season', async (_request, response) => {
  if (!pluginRestConfigured()) {
    response.json({ code: 'nsc-summer-2026', name: `${overview.title} ${overview.subtitle}`, status: overview.status, startsAt: overview.startsAt, endsAt: overview.endsAt })
    return
  }

  try {
    response.json(await pluginRequest('/api/season'))
  } catch (error) {
    console.error('Plugin season sync failed', error)
    response.status(502).json({ error: 'plugin_season_unavailable' })
  }
})
app.get('/api/map', async (_request, response) => {
  if (!pluginRestConfigured()) {
    response.json(liveMapMarkers)
    return
  }

  try {
    const markers = await pluginRequest<PluginMapResponse>('/api/map')
    response.json(markers.items)
  } catch (error) {
    console.error('Plugin map sync failed', error)
    response.status(502).json({ error: 'plugin_map_unavailable' })
  }
})
app.get('/api/shop', async (_request, response) => {
  if (!pluginRestConfigured()) {
    response.json(shop)
    return
  }

  try {
    const pluginShop = await pluginRequest<PluginShopResponse>('/api/shop')
    response.json(pluginShop.items.map(toWebShopItem))
  } catch (error) {
    console.error('Plugin shop fetch failed', error)
    response.status(502).json({ error: 'plugin_shop_unavailable' })
  }
})
app.get('/api/schedule', (_request, response) => response.json(schedule))
app.get('/api/api-docs', (_request, response) => response.json(apiEndpoints))
app.get('/api/openapi.json', (_request, response) => response.json(openApiDocument))
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(openApiDocument))

app.get('/api/admin/me', (request, response) => {
  const session = readAuthSession(request, response)
  response.json({
    authenticated: Boolean(session),
    minecraft: session?.minecraft ?? null,
    allowed: Boolean(session && adminSessionAllowed(session)),
    requiredMcid: adminMcid,
  })
})
app.post('/api/shop/purchase', async (request, response) => {
  const session = readAuthSession(request, response)
  if (!session) {
    if (!response.headersSent) {
      response.status(401).json({ error: 'unauthenticated' })
    }
    return
  }
  if (!session.minecraft) {
    response.status(400).json({ error: 'minecraft_link_required' })
    return
  }

  const { itemId, targetId } = request.body as { itemId?: string; targetId?: string }
  const item = shop.find((entry) => entry.id === itemId)
  if (!item) {
    response.status(404).json({ error: 'shop_item_not_found' })
    return
  }
  if (item.requiresTarget && !targetId) {
    response.status(400).json({ error: 'target_required' })
    return
  }

  if (pluginRestConfigured()) {
    try {
      const pluginResponse = await pluginRequest('/api/shop/purchase', {
        method: 'POST',
        body: JSON.stringify({
          buyerUuid: session.minecraft.uuid ?? undefined,
          buyerAccountId: session.minecraft.accountId,
          buyerName: session.minecraft.name,
          edition: session.minecraft.edition,
          itemId,
          targetId,
        }),
      })
      io.emit('announcement', liveEvent('announcement', 'Shop Purchase Applied', `${item.name} がゲーム内に反映されました。`))
      response.status(202).json(pluginResponse)
      return
    } catch (error) {
      console.error('Plugin shop purchase failed', error)
      response.status(502).json({ error: pluginErrorMessage(error, 'plugin_shop_purchase_failed') })
      return
    }
  }

  const payload = {
    ok: true,
    purchase: {
      itemId: item.id,
      name: item.name,
      target: item.target,
      targetId: targetId ?? null,
      buyer: session.minecraft.accountId,
      price: item.price,
      effect: item.effect,
      duration: item.duration,
      status: 'queued_for_plugin',
    },
  }
  io.emit('announcement', liveEvent('announcement', 'Shop Purchase Queued', `${item.name} の購入リクエストを受け付けました。`))
  response.status(202).json(payload)
})
app.get('/api/admin/search', requireAdmin, async (request, response) => {
  const query = String(request.query.q ?? '').trim().toLowerCase()
  if (!query) {
    response.json({ ok: true, players: [], teams: [] })
    return
  }

  try {
    const [players, teams] = pluginRestConfigured()
      ? await Promise.all([
          pluginRequest<PluginPlayersResponse>('/api/players?limit=500').then((value) => value.items.map((player, index) => toWebPlayer(player, index + 1))),
          pluginRequest<PluginTeamsResponse>('/api/teams?limit=500').then((value) => value.items.map((team, index) => toWebTeam(team, index + 1))),
        ])
      : [liveRankings, liveTeams]

    response.json({
      ok: true,
      players: players.filter((player) => [player.uuid, player.name, player.team].join(' ').toLowerCase().includes(query)).slice(0, 20),
      teams: teams.filter((team) => [team.id, team.name, team.members.join(' ')].join(' ').toLowerCase().includes(query)).slice(0, 20),
    })
  } catch (error) {
    console.error('Admin search failed', error)
    response.status(502).json({ error: pluginErrorMessage(error, 'admin_search_failed') })
  }
})
app.post('/api/admin/news', requireAdmin, (request, response) => {
  const post = {
    id: `admin-${Date.now()}`,
    title: String(request.body.title ?? 'Admin News'),
    excerpt: String(request.body.excerpt ?? request.body.markdown ?? '').slice(0, 140),
    category: String(request.body.category ?? '運営'),
    cover: String(request.body.cover ?? '/hero-summer-2026.png'),
    publishedAt: new Date().toISOString(),
    markdown: String(request.body.markdown ?? ''),
  }
  news.unshift(post)
  io.emit('announcement', liveEvent('announcement', 'News Published', post.title))
  response.status(201).json({ ok: true, post })
})
app.post('/api/admin/point', requireAdmin, async (request, response) => {
  const { uuid, amount = 0, delta = 0, action = 'add', reason = 'admin-site' } = request.body as { uuid: string; amount?: number; delta?: number; action?: 'add' | 'remove'; reason?: string }
  const numericAmount = Math.abs(Number(amount || delta))
  if (!uuid || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    response.status(400).json({ error: 'invalid_point_request' })
    return
  }

  if (pluginRestConfigured()) {
    try {
      const path = action === 'remove' ? '/api/admin/removePoint' : '/api/admin/addPoint'
      const result = await pluginRequest(path, {
        method: 'POST',
        body: JSON.stringify({ uuid, amount: numericAmount, reason }),
      })
      io.emit('announcement', liveEvent('announcement', 'Point Updated', `${uuid} のポイントを更新しました。`))
      response.json({ ok: true, result })
      return
    } catch (error) {
      console.error('Admin point sync failed', error)
      response.status(502).json({ error: pluginErrorMessage(error, 'admin_point_failed') })
      return
    }
  }

  const player = liveRankings.find((entry) => entry.uuid === uuid)
  if (!player) {
    response.status(404).json({ error: 'player_not_found' })
    return
  }
  const signedDelta = action === 'remove' ? -numericAmount : numericAmount
  const updated: RankingPlayer = { ...player, points: player.points + signedDelta }
  io.emit('player_update', updated)
  io.emit('ranking_update', liveRankings.map((entry) => (entry.uuid === updated.uuid ? updated : entry)))
  response.json({ ok: true, player: updated })
})
app.post('/api/admin/event/start', requireAdmin, async (request, response) => {
  const { type = 'announcement', message = '' } = request.body as { type?: string; message?: string }
  if (pluginRestConfigured()) {
    try {
      const event = await pluginRequest<PluginEvent>('/api/admin/startEvent', {
        method: 'POST',
        body: JSON.stringify({ type, message }),
      })
      const live = toWebEvent(event)
      io.emit('event_start', live)
      response.json({ ok: true, event: live })
      return
    } catch (error) {
      console.error('Admin event start failed', error)
      response.status(502).json({ error: pluginErrorMessage(error, 'admin_event_start_failed') })
      return
    }
  }

  const event = liveEvent(eventType(type), `Admin Event: ${type}`, message || 'イベントを開始しました。')
  io.emit('event_start', event)
  response.json({ ok: true, event })
})
app.post('/api/admin/event/end', requireAdmin, async (request, response) => {
  const { eventId = '', message = '' } = request.body as { eventId?: string; message?: string }
  if (pluginRestConfigured()) {
    try {
      const event = await pluginRequest<PluginEvent>('/api/admin/endEvent', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      })
      const live = toWebEvent(event)
      io.emit('event_end', live)
      response.json({ ok: true, event: live })
      return
    } catch (error) {
      console.error('Admin event end failed', error)
      response.status(502).json({ error: pluginErrorMessage(error, 'admin_event_end_failed') })
      return
    }
  }

  const event = liveEvent('announcement', 'Admin Event Ended', message || `イベント ${eventId || 'manual'} を終了しました。`)
  io.emit('event_end', event)
  response.json({ ok: true, event })
})
app.post('/api/admin/ban', requireAdmin, (request, response) => {
  const target = String(request.body.target ?? '')
  const reason = String(request.body.reason ?? '運営判断')
  io.emit('announcement', liveEvent('announcement', 'Disqualification Notice', `${target} に処分を記録しました: ${reason}`))
  response.json({ ok: true, ban: { ...request.body, createdAt: new Date().toISOString() } })
})
app.post('/api/admin/discord/notify', requireAdmin, (request, response) => {
  const title = String(request.body.title ?? 'NSC Announcement')
  const message = String(request.body.message ?? '')
  const event = liveEvent('announcement', title, message)
  io.emit('announcement', event)
  response.json({ ok: true, notification: event })
})

io.on('connection', (socket) => {
  if (demoData) {
    socket.emit('announcement', liveEvent('announcement', 'Demo Realtime Connected', '開発デモのリアルタイム通知です。'))
  }
})

if (demoData) {
  setInterval(() => {
    const shuffled = liveRankings.map((entry, index) => ({
      ...entry,
      previousRank: entry.rank,
      points: entry.points + Math.floor(Math.random() * 160),
      rank: index + 1,
    }))
    io.emit('ranking_update', shuffled)
  }, 15000)

  setInterval(() => {
    const eventTypes: LiveEvent['type'][] = ['supply_drop', 'boss_spawn', 'announcement']
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)] as LiveEvent['type']
    io.emit(
      type === 'supply_drop' ? 'supply_spawn' : type === 'boss_spawn' ? 'boss_spawn' : 'announcement',
      liveEvent(type, 'Demo Live Signal', '開発デモ用のリアルタイム通知です。'),
    )
  }, 22000)
}

server.listen(port, () => {
  console.log(`NSC Summer API listening on http://localhost:${port}`)
})

function requireAdmin(request: express.Request, response: express.Response, next: express.NextFunction) {
  const session = readAuthSession(request, response)
  if (session && adminSessionAllowed(session)) {
    next()
    return
  }

  const authorization = request.header('authorization') ?? ''
  if (authorization.startsWith('Bearer ')) {
    next()
    return
  }
  response.status(401).json({ error: 'unauthorized' })
}

function adminSessionAllowed(session: ReturnType<typeof readAuthSession>) {
  const minecraft = session?.minecraft
  if (!minecraft) {
    return false
  }
  return normalizeMcid(minecraft.accountId) === adminMcid || normalizeMcid(minecraft.name) === adminMcid
}

function normalizeMcid(value: string) {
  return value.trim().replace(/^BE_/i, '').toLowerCase()
}

type PluginShopItem = {
  id: string
  name: string
  category: string
  target: ShopItem['target']
  price: number
  effect: string
  durationSeconds: number
  cooldownSeconds: number
  requiresTarget: boolean
}

type PluginShopResponse = {
  items: PluginShopItem[]
}

type PluginMapResponse = {
  items: Array<{
    id: string
    type: 'base' | 'pvp' | 'safe' | 'supply' | 'boss' | 'event' | 'player' | 'border' | 'spawn'
    label: string
    x: number
    y: number
    danger: number
    world?: string
    worldX?: number
    worldY?: number
    worldZ?: number
  }>
}

type PluginPlayer = {
  uuid: string
  name: string
  kills: number
  deaths: number
  points: number
  playTimeSeconds: number
  online: boolean
  currentTeamId: string | null
  seasonRank: number | null
}

type PluginPlayersResponse = {
  items: PluginPlayer[]
}

type PluginRankingEntry = {
  rank: number
  targetId: string
  targetType: string
  displayName: string
  score: number
}

type PluginRankingResponse = {
  items: PluginRankingEntry[]
}

type PluginTeamMember = {
  playerUuid: string
  role: string
}

type PluginTeam = {
  id: string
  name: string
  points: number
  leaderUuid: string | null
  members: PluginTeamMember[]
}

type PluginTeamsResponse = {
  items: PluginTeam[]
}

type PluginEvent = {
  id: string
  type: string
  status: string
  payload?: unknown
  startsAt: string | null
  endsAt: string | null
  createdAt: string
}

type PluginEventsResponse = {
  items: PluginEvent[]
}

function pluginRestConfigured() {
  return Boolean(pluginRestBaseUrl && pluginRestToken && pluginRestToken !== 'change-me')
}

async function pluginRequest<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  if (!pluginRestBaseUrl || !pluginRestToken) {
    throw new Error('Plugin REST is not configured.')
  }

  const response = await fetch(`${pluginRestBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pluginRestToken}`,
      ...init.headers,
    },
  })

  if (!response.ok) {
    let detail = ''
    try {
      const body = (await response.json()) as { error?: string }
      detail = body.error ? ` ${body.error}` : ''
    } catch {
      // Keep the transport error readable even when the plugin returns an empty body.
    }
    throw new Error(`Plugin REST request failed: ${response.status} ${path}${detail}`)
  }

  return (await response.json()) as T
}

function pluginErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error) || !error.message) {
    return fallback
  }
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    return 'plugin_rest_unauthorized'
  }
  if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
    return 'plugin_rest_unreachable'
  }
  return error.message
}

function toWebShopItem(item: PluginShopItem): ShopItem {
  const existing = shop.find((entry) => entry.id === item.id)
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    target: item.target,
    price: item.price,
    rarity: existing?.rarity ?? rarityForPrice(item.price),
    description: existing?.description ?? item.effect,
    effect: existing?.effect ?? formatEffect(item.effect),
    duration: existing?.duration ?? formatSeconds(item.durationSeconds),
    cooldown: existing?.cooldown ?? formatSeconds(item.cooldownSeconds),
    requiresTarget: item.requiresTarget,
  }
}

function toWebRankingPlayer(entry: PluginRankingEntry): RankingPlayer {
  return {
    rank: entry.rank,
    previousRank: entry.rank,
    uuid: entry.targetId,
    name: entry.displayName,
    team: entry.targetType === 'team' ? entry.displayName : '未所属',
    points: entry.score,
    kills: 0,
    deaths: 0,
    survivalTime: 0,
    bounty: 0,
    title: entry.targetType === 'team' ? 'Team Ranking' : 'NSC Participant',
    trend: trendFor(entry.score),
    skinUrl: skinUrl(entry.targetId),
  }
}

function toWebPlayer(player: PluginPlayer, rank?: number): RankingPlayer {
  return {
    rank: rank ?? player.seasonRank ?? 0,
    previousRank: rank ?? player.seasonRank ?? 0,
    uuid: player.uuid,
    name: player.name,
    team: player.currentTeamId ?? '未所属',
    points: player.points,
    kills: player.kills,
    deaths: player.deaths,
    survivalTime: player.playTimeSeconds,
    bounty: 0,
    title: player.online ? 'Online' : 'Offline',
    trend: trendFor(player.points),
    skinUrl: skinUrl(player.uuid),
  }
}

function toWebTeam(team: PluginTeam, index?: number): Team {
  return {
    id: team.id,
    rank: index ?? 0,
    name: team.name,
    logo: team.name.slice(0, 2).toUpperCase(),
    points: team.points,
    members: team.members.map((member) => member.playerUuid),
    state: 'neutral',
    allies: [],
    enemies: [],
    color: colorFor(team.id),
  }
}

function toWebEvent(event: PluginEvent): LiveEvent {
  return {
    id: event.id,
    type: eventType(event.type),
    title: eventTitle(event),
    message: eventMessage(event),
    publishedAt: event.startsAt ?? event.createdAt,
  }
}

function trendFor(score: number) {
  const base = Math.max(12, Math.min(92, Math.round(score / 150)))
  return [base * 0.72, base * 0.82, base * 0.76, base * 0.9, base].map((value) => Math.round(Math.min(100, value)))
}

function skinUrl(uuid: string) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(uuid)}/128`
}

function colorFor(value: string) {
  const palette = ['#00CFFF', '#FF8A00', '#4CC9FF', '#FF6B35', '#83D7FF', '#E6FF0A']
  let hash = 0
  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }
  return palette[hash % palette.length]
}

function eventType(type: string): LiveEvent['type'] {
  const normalized = type.toLowerCase()
  if (normalized.includes('supply')) {
    return 'supply_drop'
  }
  if (normalized.includes('boss')) {
    return 'boss_spawn'
  }
  if (normalized.includes('mission')) {
    return 'daily_mission'
  }
  if (normalized.includes('border')) {
    return 'world_border'
  }
  if (normalized.includes('final')) {
    return 'finale'
  }
  return 'announcement'
}

function eventTitle(event: PluginEvent) {
  return formatEffect(event.type)
}

function eventMessage(event: PluginEvent) {
  if (typeof event.payload === 'object' && event.payload && 'message' in event.payload) {
    const message = (event.payload as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }
  return event.status.toLowerCase() === 'running' ? 'イベントが開催中です。' : 'イベント情報が同期されました。'
}

function rarityForPrice(price: number): ShopItem['rarity'] {
  if (price >= 10000) {
    return 'legendary'
  }
  if (price >= 5000) {
    return 'epic'
  }
  if (price >= 2000) {
    return 'rare'
  }
  return 'common'
}

function formatEffect(effect: string) {
  return effect
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatSeconds(seconds: number) {
  if (seconds <= 0) {
    return '即時'
  }
  if (seconds % 60 === 0) {
    return `${seconds / 60}分`
  }
  return `${seconds}秒`
}

function liveEvent(type: LiveEvent['type'], title: string, message: string): LiveEvent {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    publishedAt: new Date().toISOString(),
  }
}
