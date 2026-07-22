<script setup lang="ts">
import PageHero from '@/components/PageHero.vue'
import RankingTable from '@/components/RankingTable.vue'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
</script>

<template>
  <PageHero eyebrow="Ranking / Top100" title="順位はリアルタイムで変動する。" description="ポイント、キル、死亡、生存時間、チームを同期。クリック詳細に拡張しやすい構造です。" />
  <section class="section-shell pb-24">
    <RankingTable :players="store.rankings" />
  </section>
</template>
