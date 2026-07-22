import { io, type Socket } from 'socket.io-client'
import type { LiveEvent, RankingPlayer } from '@/types'

export interface RealtimeHandlers {
  rankingUpdate?: (ranking: RankingPlayer[]) => void
  playerUpdate?: (player: RankingPlayer) => void
  killEvent?: (event: LiveEvent) => void
  deathEvent?: (event: LiveEvent) => void
  supplySpawn?: (event: LiveEvent) => void
  bossSpawn?: (event: LiveEvent) => void
  eventStart?: (event: LiveEvent) => void
  eventEnd?: (event: LiveEvent) => void
  announcement?: (event: LiveEvent) => void
}

export function connectRealtime(handlers: RealtimeHandlers): Socket {
  const socketUrl = import.meta.env.VITE_SOCKET_URL ?? '/'
  const socket = io(socketUrl, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  })

  socket.on('ranking_update', (ranking: RankingPlayer[]) => handlers.rankingUpdate?.(ranking))
  socket.on('player_update', (player: RankingPlayer) => handlers.playerUpdate?.(player))
  socket.on('kill_event', (event: LiveEvent) => handlers.killEvent?.(event))
  socket.on('death_event', (event: LiveEvent) => handlers.deathEvent?.(event))
  socket.on('supply_spawn', (event: LiveEvent) => handlers.supplySpawn?.(event))
  socket.on('boss_spawn', (event: LiveEvent) => handlers.bossSpawn?.(event))
  socket.on('event_start', (event: LiveEvent) => handlers.eventStart?.(event))
  socket.on('event_end', (event: LiveEvent) => handlers.eventEnd?.(event))
  socket.on('announcement', (event: LiveEvent) => handlers.announcement?.(event))

  return socket
}
