<script setup lang="ts">
import PageHero from '@/components/PageHero.vue'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
</script>

<template>
  <PageHero eyebrow="Teams / Diplomacy" title="味方か、敵か。明日もそうとは限らない。" description="メンバー、ロゴ、ポイント、ランキング、同盟、敵対、裏切り状態を管理するチームページ。" />
  <section v-if="store.teams.length === 0" class="section-shell pb-24">
    <div class="glass rounded-3xl p-8 text-center">
      <p class="text-3xl font-black">チームデータはまだありません。</p>
      <p class="mx-auto mt-3 max-w-2xl leading-8 text-slate-300">
        `/team create` などで大会チームが作成され、プラグインAPIが同期するとここに表示されます。
      </p>
    </div>
  </section>
  <section v-else class="section-shell grid gap-5 pb-24 md:grid-cols-2">
    <article v-for="team in store.teams" :key="team.id" class="glass rounded-3xl p-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="grid h-16 w-16 place-items-center rounded-2xl text-xl font-black text-slate-950" :style="{ backgroundColor: team.color }">{{ team.logo }}</div>
          <div>
            <p class="text-2xl font-black">{{ team.name }}</p>
            <p class="text-sm text-slate-400">Rank #{{ team.rank }} / {{ team.points.toLocaleString() }} pt</p>
          </div>
        </div>
        <span class="rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase" :class="team.state === 'hostile' ? 'text-orange-200' : team.state === 'allied' ? 'text-cyan-200' : 'text-slate-300'">{{ team.state }}</span>
      </div>
      <div class="mt-5">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Members</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <span v-for="member in team.members" :key="member" class="rounded-full bg-white/8 px-3 py-1 text-sm">{{ member }}</span>
        </div>
      </div>
      <div class="mt-5 grid gap-3 md:grid-cols-2">
        <div class="rounded-2xl bg-cyan-300/10 p-4 text-sm">Allies: {{ team.allies.join(', ') || 'None' }}</div>
        <div class="rounded-2xl bg-orange-300/10 p-4 text-sm">Enemies: {{ team.enemies.join(', ') || 'Unknown' }}</div>
      </div>
    </article>
  </section>
</template>
