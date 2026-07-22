<script setup lang="ts">
import { Ban, Bell, Newspaper, Search, Settings, Trophy } from '@lucide/vue'
import PageHero from '@/components/PageHero.vue'

const tools = [
  { label: 'イベント設定', icon: Settings, body: 'イベント開始、終了、補給物資、ボス召喚、World Border。' },
  { label: 'ランキング操作', icon: Trophy, body: 'ポイント加算、減算、順位補正、監査ログ記録。' },
  { label: 'ニュース投稿', icon: Newspaper, body: 'Markdown、画像、OGP対応の告知投稿。' },
  { label: 'プレイヤー検索', icon: Search, body: 'UUID、Discord、チーム、BAN状態を横断検索。' },
  { label: 'BAN / 失格', icon: Ban, body: '大会規約違反の処分とDiscord通知。' },
  { label: 'Discord通知', icon: Bell, body: 'イベント、ボス討伐、ランキング更新を送信。' },
]
</script>

<template>
  <PageHero eyebrow="Admin Console" title="運営の判断を、すぐ大会に反映する。" description="ログイン必須の管理画面。権限管理、イベント設定、ニュース投稿、プレイヤー検索、BAN、ポイント編集まで。" />
  <section class="section-shell grid gap-5 pb-24 md:grid-cols-2 lg:grid-cols-3">
    <article v-for="tool in tools" :key="tool.label" class="glass rounded-3xl p-6">
      <component :is="tool.icon" class="text-cyan-200" :size="30" />
      <h2 class="mt-4 text-2xl font-black">{{ tool.label }}</h2>
      <p class="mt-3 leading-7 text-slate-300">{{ tool.body }}</p>
    </article>
  </section>
</template>
