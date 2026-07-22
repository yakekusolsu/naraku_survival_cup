<script setup lang="ts">
import PageHero from '@/components/PageHero.vue'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
</script>

<template>
  <PageHero eyebrow="News / Markdown Ready" title="運営からの告知も、ひとつの演出。" description="管理画面から投稿できるニュース。Markdown、画像、カテゴリ、OGPに対応する想定です。" />
  <section class="section-shell grid gap-5 pb-24 lg:grid-cols-3">
    <article v-for="post in store.news" :key="post.id" class="glass overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:shadow-neon">
      <img :src="post.cover" :alt="post.title" loading="lazy" class="h-48 w-full object-cover" />
      <div class="p-5">
        <div class="mb-3 flex items-center justify-between text-xs">
          <span class="rounded-full bg-cyan-300/15 px-3 py-1 font-black text-cyan-100">{{ post.category }}</span>
          <time class="text-slate-400">{{ post.publishedAt }}</time>
        </div>
        <h2 class="text-xl font-black leading-tight">{{ post.title }}</h2>
        <p class="mt-3 text-sm leading-7 text-slate-300">{{ post.excerpt }}</p>
      </div>
    </article>
  </section>
</template>
