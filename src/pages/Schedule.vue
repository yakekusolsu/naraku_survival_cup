<script setup lang="ts">
import PageHero from '@/components/PageHero.vue'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
</script>

<template>
  <PageHero eyebrow="Schedule" title="Day 0 から、奈落は動き出す。" description="開戦前夜、PvP解禁、補給作戦、Mythic Boss、World Border、最終日の倍率イベントまでの運営タイムライン。" />
  <section class="section-shell pb-24">
    <div class="relative grid gap-4">
      <article v-for="item in store.schedule" :key="item.day" class="glass grid gap-4 rounded-3xl p-5 md:grid-cols-[120px_120px_1fr] md:items-center">
        <div class="text-2xl font-black text-cyan-100">{{ item.day }}</div>
        <div class="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-center">
          <p class="text-xs text-slate-400">{{ item.label }}</p>
          <p class="font-black text-orange-100">{{ item.time }}</p>
        </div>
        <div>
          <h2 class="text-xl font-black">{{ item.title }}</h2>
          <p class="mt-2 whitespace-pre-line leading-8 text-slate-300">{{ item.description }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
