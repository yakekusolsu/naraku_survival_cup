<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Ban, Bell, Newspaper, Search, Settings, Trophy } from '@lucide/vue'
import PageHero from '@/components/PageHero.vue'
import { nscApi } from '@/services/api'
import type { AuthUser } from '@/types'

const ADMIN_MCID = 'yousotu_neet'
const authUser = ref<AuthUser | null>(null)
const loading = ref(true)
const loadFailed = ref(false)

const tools = [
  { label: 'イベント設定', icon: Settings, body: 'イベント開始、終了、補給物資、ボス召喚、World Border。' },
  { label: 'ランキング操作', icon: Trophy, body: 'ポイント加算、減算、順位補正、監査ログ記録。' },
  { label: 'ニュース投稿', icon: Newspaper, body: 'Markdown、画像、OGP対応の告知投稿。' },
  { label: 'プレイヤー検索', icon: Search, body: 'UUID、Discord、チーム、BAN状態を横断検索。' },
  { label: 'BAN / 失格', icon: Ban, body: '大会規約違反の処分とDiscord通知。' },
  { label: 'Discord通知', icon: Bell, body: 'イベント、ボス討伐、ランキング更新を送信。' },
]

const linkedMcid = computed(() => authUser.value?.minecraft?.accountId ?? authUser.value?.minecraft?.name ?? '')
const authorized = computed(() => {
  const minecraft = authUser.value?.minecraft
  if (!minecraft) {
    return false
  }
  return normalizeMcid(minecraft.accountId) === ADMIN_MCID || normalizeMcid(minecraft.name) === ADMIN_MCID
})

onMounted(async () => {
  try {
    authUser.value = (await nscApi.authMe()).user
  } catch {
    loadFailed.value = true
    authUser.value = null
  } finally {
    loading.value = false
  }
})

function normalizeMcid(value: string) {
  return value.trim().toLowerCase()
}
</script>

<template>
  <PageHero
    v-if="authorized"
    eyebrow="Admin Console"
    title="運営の判断を、すぐ大会に反映する。"
    description="ログイン必須の管理画面。権限管理、イベント設定、ニュース投稿、プレイヤー検索、BAN、ポイント編集まで。"
  />
  <PageHero
    v-else
    eyebrow="Admin Locked"
    title="管理画面は主催者専用です。"
    description="Minecraft ID yousotu_neet と連携したDiscordアカウントのみアクセスできます。"
  />

  <section v-if="loading" class="section-shell pb-24">
    <div class="glass rounded-3xl p-8">
      <p class="text-2xl font-black">認証状態を確認中です。</p>
    </div>
  </section>

  <section v-else-if="!authorized" class="section-shell pb-24">
    <div class="glass max-w-2xl rounded-3xl p-8">
      <p class="eyebrow">403 / Owner Only</p>
      <h2 class="mt-3 text-3xl font-black">このページは表示できません。</h2>
      <p class="mt-4 leading-8 text-slate-300">
        現在のDiscordアカウントは、管理者Minecraft IDと連携されていません。
      </p>
      <p v-if="linkedMcid" class="mt-4 rounded-2xl bg-white/8 p-4 text-sm font-bold text-slate-300">
        現在の連携ID: {{ linkedMcid }}
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <RouterLink v-if="loadFailed" class="btn-primary" to="/login">Discordでログイン</RouterLink>
        <RouterLink v-else class="btn-primary" to="/my-page">My Pageで連携を確認</RouterLink>
        <RouterLink class="btn-ghost" to="/">Homeへ戻る</RouterLink>
      </div>
    </div>
  </section>

  <section v-else class="section-shell grid gap-5 pb-24 md:grid-cols-2 lg:grid-cols-3">
    <article v-for="tool in tools" :key="tool.label" class="glass rounded-3xl p-6">
      <component :is="tool.icon" class="text-cyan-200" :size="30" />
      <h2 class="mt-4 text-2xl font-black">{{ tool.label }}</h2>
      <p class="mt-3 leading-7 text-slate-300">{{ tool.body }}</p>
    </article>
  </section>
</template>
