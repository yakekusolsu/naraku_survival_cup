<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUp, Minus, Search } from '@lucide/vue'
import type { RankingPlayer } from '@/types'

const props = defineProps<{
  players: RankingPlayer[]
  compact?: boolean
}>()

const query = ref('')
const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  if (!normalized) return props.players
  return props.players.filter((player) => [player.name, player.team, player.title].join(' ').toLowerCase().includes(normalized))
})

function movement(player: RankingPlayer) {
  return player.previousRank - player.rank
}
</script>

<template>
  <div class="glass overflow-hidden rounded-3xl">
    <div class="flex flex-col gap-4 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="eyebrow">Realtime Ranking</p>
        <h2 class="text-2xl font-black">Top {{ players.length }}</h2>
      </div>
      <label class="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 text-sm text-slate-300">
        <Search :size="18" />
        <input v-model="query" class="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Search player / team" />
      </label>
    </div>
    <div v-if="filtered.length === 0" class="p-8 text-center">
      <p class="text-2xl font-black text-white">ランキングデータはまだありません。</p>
      <p class="mt-3 text-sm leading-7 text-slate-300">
        Minecraftプラグインまたは本番APIが接続されると、参加プレイヤーだけがここに表示されます。
      </p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[760px] text-left">
        <thead class="bg-white/5 text-xs uppercase tracking-[0.16em] text-slate-400">
          <tr>
            <th class="px-5 py-4">Rank</th>
            <th class="px-5 py-4">Player</th>
            <th class="px-5 py-4">Points</th>
            <th class="px-5 py-4">K/D</th>
            <th class="px-5 py-4">Survival</th>
            <th class="px-5 py-4">Team</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in filtered" :key="player.uuid" class="border-t border-white/8 transition hover:bg-cyan-300/8">
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <span class="text-xl font-black text-cyan-100">#{{ player.rank }}</span>
                <span class="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/8 text-xs" :class="movement(player) > 0 ? 'text-cyan-200' : movement(player) < 0 ? 'text-orange-200' : 'text-slate-400'">
                  <ArrowUp v-if="movement(player) > 0" :size="14" />
                  <ArrowDown v-else-if="movement(player) < 0" :size="14" />
                  <Minus v-else :size="14" />
                </span>
              </div>
            </td>
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <img :src="player.skinUrl" :alt="`${player.name} head`" loading="lazy" class="h-10 w-10 rounded-xl border border-cyan-200/20 bg-slate-800" />
                <div>
                  <p class="font-black text-white">{{ player.name }}</p>
                  <p class="text-xs text-slate-400">{{ player.title }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-4 font-black text-orange-100">{{ player.points.toLocaleString() }}</td>
            <td class="px-5 py-4 text-slate-200">{{ player.kills }} / {{ player.deaths }}</td>
            <td class="px-5 py-4 text-slate-300">{{ Math.floor(player.survivalTime / 3600) }}h</td>
            <td class="px-5 py-4 text-cyan-100">{{ player.team }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
