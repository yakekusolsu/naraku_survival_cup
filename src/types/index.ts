export type TournamentStatus = 'preparing' | 'running' | 'finale' | 'ended'

export type EventType =
  | 'supply_drop'
  | 'boss_spawn'
  | 'daily_mission'
  | 'world_border'
  | 'announcement'
  | 'finale'

export type DiplomaticState = 'allied' | 'hostile' | 'neutral' | 'betrayed'

export interface TournamentOverview {
  title: string
  subtitle: string
  tagline: string
  status: TournamentStatus
  startsAt: string
  endsAt: string
  durationDays: number
  prize: string
  participants: number
  maxParticipants: number
  mapSize: string
  pvpStartsAt: string
  finaleStartsAt: string
  discordUrl: string
}

export interface RankingPlayer {
  rank: number
  previousRank: number
  uuid: string
  name: string
  team: string
  points: number
  kills: number
  deaths: number
  survivalTime: number
  bounty: number
  title: string
  trend: number[]
  skinUrl: string
}

export interface MinecraftProfile {
  accountId: string
  name: string
  uuid: string | null
  edition: 'java' | 'bedrock' | 'floodgate'
  source: 'mojang' | 'prefixed_id'
  linkedAt: string
}

export interface AuthUser {
  discordId: string
  username: string
  displayName: string
  avatarUrl: string | null
  email: string | null
  minecraft: MinecraftProfile | null
  role: 'participant'
  issuedAt: number
  expiresAt: number
}

export interface AuthMeResponse {
  user: AuthUser
}

export interface Team {
  id: string
  rank: number
  name: string
  logo: string
  points: number
  members: string[]
  state: DiplomaticState
  allies: string[]
  enemies: string[]
  color: string
}

export interface NewsPost {
  id: string
  title: string
  excerpt: string
  category: string
  cover: string
  publishedAt: string
  markdown: string
}

export interface ScheduleItem {
  day: string
  label: string
  time: string
  title: string
  description: string
  status: 'locked' | 'active' | 'completed'
}

export interface MapMarker {
  id: string
  type: 'base' | 'pvp' | 'safe' | 'supply' | 'boss' | 'event'
  label: string
  x: number
  y: number
  danger: number
}

export interface ShopItem {
  id: string
  name: string
  category: string
  target: 'self' | 'team' | 'enemy_team' | 'enemy_player' | 'world'
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  description: string
  effect: string
  duration: string
  cooldown: string
  requiresTarget: boolean
}

export interface LiveEvent {
  id: string
  type: EventType
  title: string
  message: string
  publishedAt: string
}

export interface ApiEndpoint {
  method: 'GET' | 'POST'
  path: string
  auth: boolean
  description: string
}

export interface DashboardMetric {
  label: string
  value: string
  delta: string
}

export interface TournamentPayload {
  overview: TournamentOverview
  rankings: RankingPlayer[]
  teams: Team[]
  news: NewsPost[]
  schedule: ScheduleItem[]
  map: MapMarker[]
  shop: ShopItem[]
  events: LiveEvent[]
  api: ApiEndpoint[]
}
