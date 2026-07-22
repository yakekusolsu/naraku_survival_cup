import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { nscApi } from '@/services/api'
import { connectRealtime } from '@/services/realtime'
import { apiEndpoints, news, overview, schedule, shop } from '@/data/mock'
import type { ApiEndpoint, LiveEvent, MapMarker, NewsPost, RankingPlayer, ScheduleItem, ShopItem, Team, TournamentOverview } from '@/types'

export const useTournamentStore = defineStore('tournament', () => {
  const overviewState = ref<TournamentOverview>({ ...overview, participants: 0 })
  const rankingsState = ref<RankingPlayer[]>([])
  const teamsState = ref<Team[]>([])
  const newsState = ref<NewsPost[]>(news)
  const scheduleState = ref<ScheduleItem[]>(schedule)
  const mapState = ref<MapMarker[]>([])
  const shopState = ref<ShopItem[]>(shop)
  const eventsState = ref<LiveEvent[]>([])
  const apiState = ref<ApiEndpoint[]>(apiEndpoints)
  const connected = ref(false)
  const lastSync = ref<string>('plugin-pending')

  const topPlayers = computed(() => rankingsState.value.slice(0, 5))
  const topTeams = computed(() => teamsState.value.slice(0, 4))
  const liveTicker = computed(() => eventsState.value.slice(0, 6))

  async function hydrate() {
    const loaders = [
      nscApi.overview().then((value) => (overviewState.value = value)),
      nscApi.ranking().then((value) => (rankingsState.value = value)),
      nscApi.teams().then((value) => (teamsState.value = value)),
      nscApi.news().then((value) => (newsState.value = value)),
      nscApi.schedule().then((value) => (scheduleState.value = value as ScheduleItem[])),
      nscApi.map().then((value) => (mapState.value = value)),
      nscApi.shop().then((value) => (shopState.value = value)),
      nscApi.events().then((value) => (eventsState.value = value)),
      nscApi.apiDocs().then((value) => (apiState.value = value)),
    ]
    try {
      await Promise.all(loaders)
      lastSync.value = new Date().toISOString()
    } catch {
      rankingsState.value = []
      teamsState.value = []
      mapState.value = []
      eventsState.value = []
      overviewState.value = { ...overviewState.value, participants: 0 }
      lastSync.value = 'plugin-unavailable'
    }
  }

  function startRealtime() {
    const socket = connectRealtime({
      rankingUpdate: (ranking) => {
        rankingsState.value = ranking
        lastSync.value = new Date().toISOString()
      },
      playerUpdate: (player) => {
        rankingsState.value = rankingsState.value.map((entry) => (entry.uuid === player.uuid ? player : entry))
      },
      killEvent: pushEvent,
      deathEvent: pushEvent,
      supplySpawn: pushEvent,
      bossSpawn: pushEvent,
      eventStart: pushEvent,
      eventEnd: pushEvent,
      announcement: pushEvent,
    })
    socket.on('connect', () => (connected.value = true))
    socket.on('disconnect', () => (connected.value = false))
  }

  function pushEvent(event: LiveEvent) {
    eventsState.value = [event, ...eventsState.value].slice(0, 20)
  }

  return {
    overview: overviewState,
    rankings: rankingsState,
    teams: teamsState,
    news: newsState,
    schedule: scheduleState,
    map: mapState,
    shop: shopState,
    events: eventsState,
    api: apiState,
    connected,
    lastSync,
    topPlayers,
    topTeams,
    liveTicker,
    hydrate,
    startRealtime,
  }
})
