<script setup lang="ts">
import PageHero from '@/components/PageHero.vue'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
const colorByType: Record<string, string> = {
  base: '#00CFFF',
  pvp: '#FF6B35',
  safe: '#4CC9FF',
  supply: '#FFB347',
  boss: '#FF8A00',
  event: '#DCEFFF',
  player: '#E6FF0A',
  border: '#FF6B35',
  spawn: '#4CC9FF',
}
</script>

<template>
  <PageHero eyebrow="Live Map" title="海岸線の支配状況を、リアルタイムで読む。" description="Leaflet/OpenLayersへ差し替え可能なマップUI。現在位置、拠点、PvPエリア、セーフゾーン、補給物資、ボス位置に対応。" />
  <section class="section-shell pb-24">
    <div class="glass overflow-hidden rounded-[2rem]">
      <div class="map-grid relative h-[620px]">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,transparent,rgba(6,24,39,.66))]" />
        <div v-if="store.map.length === 0" class="absolute inset-0 z-10 grid place-items-center p-6 text-center">
          <div class="glass max-w-xl rounded-3xl p-8">
            <p class="text-3xl font-black">マップデータは未接続です。</p>
            <p class="mt-3 leading-8 text-slate-300">
              プラグインまたは地図サービスから地点情報が同期されると、拠点・補給物資・ボス位置が表示されます。
            </p>
          </div>
        </div>
        <button
          v-for="marker in store.map"
          :key="marker.id"
          class="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 px-3 py-2 text-xs font-black shadow-neon transition hover:scale-110"
          :style="{ left: `${marker.x}%`, top: `${marker.y}%`, backgroundColor: `${colorByType[marker.type]}33`, color: colorByType[marker.type] }"
          type="button"
        >
          {{ marker.label }}
        </button>
      </div>
      <div class="grid gap-3 border-t border-white/10 p-5 md:grid-cols-6">
        <div v-for="marker in store.map" :key="`${marker.id}-legend`" class="rounded-2xl bg-white/8 p-3 text-sm">
          <p class="font-black" :style="{ color: colorByType[marker.type] }">{{ marker.type }}</p>
          <p class="text-slate-300">{{ marker.label }}</p>
          <p v-if="marker.worldX !== undefined && marker.worldZ !== undefined" class="mt-1 text-xs text-slate-400">
            {{ marker.world }} {{ marker.worldX }}, {{ marker.worldZ }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
