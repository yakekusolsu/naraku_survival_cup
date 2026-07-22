import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import swaggerUi from 'swagger-ui-express'
import { registerDiscordAuthRoutes } from './auth'
import { loadEnvFile } from './env'
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
} from '../src/data/mock'
import { openApiDocument } from './openapi'
import type { LiveEvent, RankingPlayer } from '../src/types'

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

app.get('/api/overview', (_request, response) => response.json(liveOverview))
app.get('/api/ranking', (_request, response) => response.json(liveRankings))
app.get('/api/players', (_request, response) => response.json(liveRankings))
app.get('/api/player/:uuid', (request, response) => {
  const player = liveRankings.find((entry) => entry.uuid === request.params.uuid || entry.name.toLowerCase() === request.params.uuid.toLowerCase())
  response.status(player ? 200 : 404).json(player ?? { error: 'player_not_found' })
})
app.get('/api/teams', (_request, response) => response.json(liveTeams))
app.get('/api/team/:id', (request, response) => {
  const team = liveTeams.find((entry) => entry.id === request.params.id)
  response.status(team ? 200 : 404).json(team ?? { error: 'team_not_found' })
})
app.get('/api/news', (_request, response) => response.json(news))
app.get('/api/event', (_request, response) => response.json(liveEvents))
app.get('/api/map', (_request, response) => response.json(liveMapMarkers))
app.get('/api/shop', (_request, response) => response.json(shop))
app.get('/api/schedule', (_request, response) => response.json(schedule))
app.get('/api/api-docs', (_request, response) => response.json(apiEndpoints))
app.get('/api/openapi.json', (_request, response) => response.json(openApiDocument))
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(openApiDocument))

app.post('/api/shop/purchase', requireAdmin, (request, response) => {
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

  const payload = {
    ok: true,
    purchase: {
      itemId: item.id,
      name: item.name,
      target: item.target,
      targetId: targetId ?? null,
      price: item.price,
      effect: item.effect,
      duration: item.duration,
      status: 'queued_for_plugin',
    },
  }
  io.emit('announcement', liveEvent('announcement', 'Shop Purchase Queued', `${item.name} の購入リクエストを受け付けました。`))
  response.status(202).json(payload)
})
app.post('/api/admin/news', requireAdmin, (request, response) => response.status(201).json({ ok: true, post: request.body }))
app.post('/api/admin/point', requireAdmin, (request, response) => {
  const { uuid, delta = 0 } = request.body as { uuid: string; delta: number }
  const player = liveRankings.find((entry) => entry.uuid === uuid)
  if (!player) {
    response.status(404).json({ error: 'player_not_found' })
    return
  }
  const updated: RankingPlayer = { ...player, points: player.points + Number(delta) }
  io.emit('player_update', updated)
  io.emit('ranking_update', liveRankings.map((entry) => (entry.uuid === updated.uuid ? updated : entry)))
  response.json({ ok: true, player: updated })
})
app.post('/api/admin/ban', requireAdmin, (request, response) => response.json({ ok: true, ban: request.body }))

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
  const authorization = request.header('authorization') ?? ''
  if (authorization.startsWith('Bearer ')) {
    next()
    return
  }
  response.status(401).json({ error: 'unauthorized' })
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
