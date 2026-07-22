<script setup lang="ts">
import PageHero from '@/components/PageHero.vue'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
const socketEvents = ['ranking_update', 'player_update', 'kill_event', 'death_event', 'supply_spawn', 'boss_spawn', 'event_start', 'event_end', 'announcement']
</script>

<template>
  <PageHero eyebrow="API / OpenAPI" title="Paper Plugin と公式サイトをつなぐ仕様。" description="Minecraft(Paper) → Java Plugin → REST API → Node.js → Vue.js を前提にしたAPIドキュメント。" />
  <section class="section-shell grid gap-8 pb-24 lg:grid-cols-[1.1fr_.9fr]">
    <div class="glass overflow-hidden rounded-3xl">
      <div class="border-b border-white/10 p-5">
        <h2 class="text-2xl font-black">REST Endpoints</h2>
      </div>
      <div class="divide-y divide-white/10">
        <div v-for="endpoint in store.api" :key="`${endpoint.method}-${endpoint.path}`" class="grid gap-3 p-5 md:grid-cols-[90px_1fr]">
          <span class="rounded-full px-3 py-1 text-center text-xs font-black" :class="endpoint.method === 'GET' ? 'bg-cyan-300/15 text-cyan-100' : 'bg-orange-300/15 text-orange-100'">{{ endpoint.method }}</span>
          <div>
            <p class="font-mono text-sm text-white">{{ endpoint.path }}</p>
            <p class="mt-1 text-sm text-slate-300">{{ endpoint.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="glass rounded-3xl p-6">
      <h2 class="text-2xl font-black">WebSocket Events</h2>
      <div class="mt-5 grid gap-3">
        <code v-for="event in socketEvents" :key="event" class="rounded-2xl border border-cyan-300/15 bg-cyan-300/8 p-3 text-cyan-100">{{ event }}</code>
      </div>
      <a href="/api/swagger" class="btn-primary mt-6 w-full">Swagger UI</a>
    </div>
  </section>
</template>
