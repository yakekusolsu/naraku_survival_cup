<script setup lang="ts">
import { Radio } from '@lucide/vue'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
</script>

<template>
  <div class="fixed inset-x-0 top-16 z-40 border-b border-[#2753821f] bg-[#83D7FF]/80 text-[#153C66] backdrop-blur-xl">
    <div class="mx-auto flex h-9 w-[min(1220px,calc(100%-24px))] items-center overflow-hidden">
      <span class="mr-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#E6FF0A] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#153C66]">
        <Radio :size="14" class="animate-pulse" />
        Live
      </span>
      <div v-if="store.liveTicker.length === 0" class="min-w-0 text-xs font-black text-[#153C66]">
        プラグイン接続待機中。実サーバー起動後、イベント通知がここに流れます。
      </div>
      <div v-else class="flex min-w-0 gap-8 whitespace-nowrap text-xs text-[#153C66]">
        <span v-for="event in store.liveTicker" :key="event.id" class="ticker-item">
          <b class="text-[#FF8A00]">{{ event.title }}</b>
          <span class="mx-2 text-[#275382]/40">/</span>
          {{ event.message }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker-item {
  animation: slideTicker 28s linear infinite;
}

@keyframes slideTicker {
  from {
    transform: translateX(25vw);
  }
  to {
    transform: translateX(-120vw);
  }
}
</style>
