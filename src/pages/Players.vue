<script setup lang="ts">
import PageHero from '@/components/PageHero.vue'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
</script>

<template>
  <PageHero eyebrow="Players" title="参加者は、物語そのもの。" description="スキン、ヘッド、統計、ポイント、略奪回数、称号、ログイン履歴を表示するプレイヤー名鑑。" />
  <section v-if="store.rankings.length === 0" class="section-shell pb-24">
    <div class="glass rounded-3xl p-8 text-center">
      <p class="text-3xl font-black">プレイヤーデータはまだありません。</p>
      <p class="mx-auto mt-3 max-w-2xl leading-8 text-slate-300">
        プラグイン導入後、PaperサーバーがREST APIへプレイヤー情報を同期すると、実際の参加者だけが表示されます。
      </p>
    </div>
  </section>
  <section v-else class="section-shell grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
    <article v-for="player in store.rankings" :key="player.uuid" class="glass rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-neon">
      <div class="flex items-center gap-4">
        <img :src="player.skinUrl" :alt="`${player.name} head`" loading="lazy" class="h-16 w-16 rounded-2xl border border-cyan-300/25" />
        <div>
          <p class="text-xl font-black">{{ player.name }}</p>
          <p class="text-sm text-cyan-100">{{ player.title }}</p>
        </div>
      </div>
      <div class="mt-5 grid grid-cols-3 gap-2 text-center">
        <div class="rounded-2xl bg-white/8 p-3"><p class="text-xs text-slate-400">Point</p><p class="font-black">{{ player.points.toLocaleString() }}</p></div>
        <div class="rounded-2xl bg-white/8 p-3"><p class="text-xs text-slate-400">Kill</p><p class="font-black">{{ player.kills }}</p></div>
        <div class="rounded-2xl bg-white/8 p-3"><p class="text-xs text-slate-400">Death</p><p class="font-black">{{ player.deaths }}</p></div>
      </div>
      <div class="mt-4 rounded-2xl border border-orange-300/20 bg-orange-300/10 p-3 text-sm text-orange-100">賞金首: {{ player.bounty.toLocaleString() }} pt</div>
    </article>
  </section>
</template>
