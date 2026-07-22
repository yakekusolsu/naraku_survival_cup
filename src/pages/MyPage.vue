<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import { nscApi } from '@/services/api'
import { useTournamentStore } from '@/stores/tournament'
import type { AuthUser } from '@/types'

const store = useTournamentStore()
const me = computed(() => store.rankings[0])
const authUser = ref<AuthUser | null>(null)
const minecraftName = ref('')
const edition = ref<'java' | 'bedrock' | 'floodgate'>('java')
const linkMessage = ref('')
const isLinking = ref(false)
const linkedAccountPreview = computed(() => {
  const value = minecraftName.value.trim()
  if (!value) {
    return ''
  }

  return edition.value === 'java' ? value : `BE_${value.replace(/^BE_/i, '')}`
})

onMounted(async () => {
  try {
    authUser.value = (await nscApi.authMe()).user
  } catch {
    authUser.value = null
  }
})

async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
  authUser.value = null
}

async function linkMinecraft() {
  linkMessage.value = ''
  isLinking.value = true
  try {
    authUser.value = (
      await nscApi.linkMinecraft({
        minecraftName: minecraftName.value,
        edition: edition.value,
      })
    ).user
    minecraftName.value = ''
    linkMessage.value = 'Minecraft IDを連携しました。'
  } catch {
    linkMessage.value = '連携できませんでした。Minecraft IDを確認してください。'
  } finally {
    isLinking.value = false
  }
}

async function unlinkMinecraft() {
  linkMessage.value = ''
  try {
    authUser.value = (await nscApi.unlinkMinecraft()).user
    linkMessage.value = 'Minecraft連携を解除しました。'
  } catch {
    linkMessage.value = '連携解除に失敗しました。'
  }
}
</script>

<template>
  <PageHero eyebrow="My Page" title="自分の戦績、実績、通知を一箇所に。" description="プロフィール編集、実績、ランキング推移、所持ポイント、購入履歴、通知を表示する参加者用ページ。" />
  <section class="section-shell grid gap-6 pb-24 lg:grid-cols-[360px_1fr]">
    <aside v-if="!me" class="glass rounded-3xl p-6 lg:col-span-2">
      <template v-if="authUser">
        <div class="flex flex-wrap items-center gap-4">
          <img v-if="authUser.avatarUrl" :src="authUser.avatarUrl" :alt="authUser.displayName" class="h-16 w-16 rounded-2xl border border-cyan-300/25" />
          <div>
            <p class="eyebrow">Discord Connected</p>
            <h2 class="mt-2 text-3xl font-black">{{ authUser.displayName }}</h2>
            <p class="mt-1 text-slate-300">@{{ authUser.username }} / {{ authUser.discordId }}</p>
          </div>
        </div>
        <p class="mt-5 leading-8 text-slate-300">
          Discordログインは完了しています。Minecraft ID を紐付けると、大会プロフィールとショップ購入履歴がここに表示されます。
        </p>

        <div v-if="authUser.minecraft" class="mt-6 rounded-3xl border border-cyan-300/25 bg-cyan-300/10 p-5">
          <p class="eyebrow">Minecraft Linked</p>
          <h3 class="mt-2 text-2xl font-black">{{ authUser.minecraft.name }}</h3>
          <p class="mt-2 break-all text-sm font-bold text-slate-300">Account ID: {{ authUser.minecraft.accountId }}</p>
          <p v-if="authUser.minecraft.uuid" class="mt-1 break-all text-sm font-bold text-slate-300">UUID: {{ authUser.minecraft.uuid }}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-xs font-black uppercase">
            <span class="rounded-full bg-[#E6FF0A]/60 px-3 py-1 text-[#153C66]">{{ authUser.minecraft.edition }}</span>
            <span class="rounded-full bg-white/8 px-3 py-1 text-slate-300">{{ authUser.minecraft.source }}</span>
          </div>
          <button class="btn-secondary mt-5" type="button" @click="unlinkMinecraft">Minecraft連携を解除</button>
        </div>

        <form v-else class="mt-6 grid gap-4 rounded-3xl border border-[#275382]/15 bg-white/45 p-5" @submit.prevent="linkMinecraft">
          <div>
            <p class="eyebrow">Minecraft Link</p>
            <h3 class="mt-2 text-2xl font-black">Minecraft IDを連携</h3>
            <p class="mt-2 text-sm leading-7 text-slate-300">
              Java版はMinecraft IDからUUIDを自動取得します。Bedrock / Floodgate は入力したIDの先頭に必ず BE_ を付けて連携します。
            </p>
          </div>
          <label class="grid gap-2 text-sm font-bold">
            Edition
            <select v-model="edition" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 outline-none">
              <option value="java">Java</option>
              <option value="bedrock">Bedrock</option>
              <option value="floodgate">Floodgate</option>
            </select>
          </label>
          <label class="grid gap-2 text-sm font-bold">
            Minecraft ID
            <input v-model.trim="minecraftName" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 outline-none" placeholder="例: Notch / Steve" />
          </label>
          <p v-if="linkedAccountPreview" class="rounded-2xl bg-white/8 p-4 text-sm font-bold text-slate-300">連携ID: {{ linkedAccountPreview }}</p>
          <button class="btn-primary" type="submit" :disabled="isLinking">{{ isLinking ? '連携中...' : 'Minecraftを連携' }}</button>
        </form>

        <p v-if="linkMessage" class="mt-4 rounded-2xl bg-white/8 p-4 text-sm font-bold text-slate-300">{{ linkMessage }}</p>
        <button class="btn-secondary mt-6" type="button" @click="logout">ログアウト</button>
      </template>
      <template v-else>
        <h2 class="text-3xl font-black">マイページは連携待機中です。</h2>
        <p class="mt-3 leading-8 text-slate-300">
          Discord OAuth と Minecraft 連携、またはプラグインからの参加者同期が完了すると、実際のプロフィールが表示されます。
        </p>
        <RouterLink class="btn-primary mt-6" to="/login">Discordでログイン</RouterLink>
      </template>
    </aside>
    <template v-else>
      <aside class="glass rounded-3xl p-6">
        <img :src="me.skinUrl" :alt="me.name" class="h-24 w-24 rounded-3xl border border-cyan-300/25" />
        <h2 class="mt-4 text-3xl font-black">{{ me.name }}</h2>
        <p class="text-cyan-100">{{ me.title }}</p>
        <div class="mt-6 grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-white/8 p-4"><p class="text-xs text-slate-400">Rank</p><p class="text-2xl font-black">#{{ me.rank }}</p></div>
          <div class="rounded-2xl bg-white/8 p-4"><p class="text-xs text-slate-400">Point</p><p class="text-2xl font-black">{{ me.points.toLocaleString() }}</p></div>
        </div>
      </aside>
      <div class="grid gap-5">
        <div class="glass rounded-3xl p-6">
          <p class="eyebrow">Progress</p>
          <h2 class="mt-3 text-2xl font-black">ランキング推移</h2>
          <div class="mt-5 flex h-32 items-end gap-2">
            <span v-for="(point, index) in me.trend" :key="index" class="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-500 to-orange-300" :style="{ height: `${point}%` }" />
          </div>
        </div>
        <div class="glass rounded-3xl p-6">
          <p class="eyebrow">Notifications</p>
          <div class="mt-4 grid gap-3">
            <p class="rounded-2xl bg-white/8 p-4">通知はまだありません。</p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
