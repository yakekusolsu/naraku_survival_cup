<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Ban, Bell, Minus, Newspaper, Play, Plus, Search, Settings, Square, Trophy } from '@lucide/vue'
import PageHero from '@/components/PageHero.vue'
import { nscApi } from '@/services/api'
import type { AuthUser, RankingPlayer, Team } from '@/types'

type ToolId = 'events' | 'ranking' | 'news' | 'search' | 'ban' | 'discord'

const ADMIN_MCID = 'yousotu_neet'
const authUser = ref<AuthUser | null>(null)
const serverAllowed = ref(false)
const serverRequiredMcid = ref(ADMIN_MCID)
const loading = ref(true)
const loadFailed = ref(false)
const activeTool = ref<ToolId>('events')
const busy = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const eventType = ref('announcement')
const eventMessage = ref('')
const eventId = ref('')
const pointTarget = ref('')
const pointAmount = ref(100)
const pointAction = ref<'add' | 'remove'>('add')
const pointReason = ref('admin-site')
const newsTitle = ref('')
const newsCategory = ref('運営')
const newsExcerpt = ref('')
const newsMarkdown = ref('')
const searchQuery = ref('')
const foundPlayers = ref<RankingPlayer[]>([])
const foundTeams = ref<Team[]>([])
const banTarget = ref('')
const banType = ref<'ban' | 'disqualify'>('disqualify')
const banReason = ref('')
const banNotifyDiscord = ref(true)
const notifyTitle = ref('')
const notifyMessage = ref('')

const tools: Array<{ id: ToolId; label: string; icon: typeof Settings; body: string }> = [
  { id: 'events', label: 'イベント設定', icon: Settings, body: 'イベント開始、終了、補給物資、ボス召喚、World Border。' },
  { id: 'ranking', label: 'ランキング操作', icon: Trophy, body: 'ポイント加算、減算、順位補正、監査ログ記録。' },
  { id: 'news', label: 'ニュース投稿', icon: Newspaper, body: 'Markdown、画像、OGP対応の告知投稿。' },
  { id: 'search', label: 'プレイヤー検索', icon: Search, body: 'UUID、Discord、チーム、BAN状態を横断検索。' },
  { id: 'ban', label: 'BAN / 失格', icon: Ban, body: '大会規約違反の処分とDiscord通知。' },
  { id: 'discord', label: 'Discord通知', icon: Bell, body: 'イベント、ボス討伐、ランキング更新を送信。' },
]

const eventTypes = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'supply-drop', label: 'Supply Drop' },
  { value: 'boss-spawn', label: 'Boss Spawn' },
  { value: 'daily-mission', label: 'Daily Mission' },
  { value: 'world-border', label: 'World Border' },
  { value: 'random-event', label: 'Random Event' },
]

const linkedMcid = computed(() => authUser.value?.minecraft?.accountId ?? authUser.value?.minecraft?.name ?? '')
const locallyAuthorized = computed(() => {
  const minecraft = authUser.value?.minecraft
  if (!minecraft) {
    return false
  }
  return normalizeMcid(minecraft.accountId) === ADMIN_MCID || normalizeMcid(minecraft.name) === ADMIN_MCID
})
const authorized = computed(() => locallyAuthorized.value || serverAllowed.value)

onMounted(async () => {
  try {
    authUser.value = (await nscApi.authMe()).user
    const admin = await nscApi.adminMe()
    serverAllowed.value = admin.allowed
    serverRequiredMcid.value = admin.requiredMcid
  } catch {
    loadFailed.value = true
    authUser.value = null
    serverAllowed.value = false
  } finally {
    loading.value = false
  }
})

async function runAction(action: () => Promise<string>) {
  busy.value = true
  statusMessage.value = ''
  errorMessage.value = ''
  try {
    statusMessage.value = await action()
  } catch (error) {
    errorMessage.value = adminErrorMessage(error)
  } finally {
    busy.value = false
  }
}

function startEvent() {
  return runAction(async () => {
    const result = await nscApi.adminStartEvent({ type: eventType.value, message: eventMessage.value })
    eventId.value = result.event.id
    return `イベントを開始しました: ${result.event.title}`
  })
}

function endEvent() {
  return runAction(async () => {
    const result = await nscApi.adminEndEvent({ eventId: eventId.value, message: eventMessage.value })
    return `イベントを終了しました: ${result.event.title}`
  })
}

function updatePoint() {
  return runAction(async () => {
    await nscApi.adminPoint({
      uuid: pointTarget.value,
      amount: pointAmount.value,
      action: pointAction.value,
      reason: pointReason.value,
    })
    return `${pointTarget.value} のポイントを更新しました。`
  })
}

function publishNews() {
  return runAction(async () => {
    const result = await nscApi.adminNews({
      title: newsTitle.value,
      category: newsCategory.value,
      excerpt: newsExcerpt.value,
      markdown: newsMarkdown.value,
    })
    return `ニュースを投稿しました: ${result.post.title}`
  })
}

function searchAdmin() {
  return runAction(async () => {
    const result = await nscApi.adminSearch(searchQuery.value)
    foundPlayers.value = result.players
    foundTeams.value = result.teams
    return `検索結果: プレイヤー${result.players.length}件 / チーム${result.teams.length}件`
  })
}

function submitBan() {
  return runAction(async () => {
    await nscApi.adminBan({
      target: banTarget.value,
      reason: banReason.value,
      type: banType.value,
      notifyDiscord: banNotifyDiscord.value,
    })
    return `${banTarget.value} の処分を記録しました。`
  })
}

function sendNotification() {
  return runAction(async () => {
    await nscApi.adminNotify({ title: notifyTitle.value, message: notifyMessage.value })
    return '通知を送信しました。'
  })
}

async function logout() {
  await nscApi.logout()
  authUser.value = null
  serverAllowed.value = false
  loadFailed.value = true
  statusMessage.value = 'ログアウトしました。'
}

function normalizeMcid(value: string) {
  return value.trim().replace(/^BE_/i, '').toLowerCase()
}

function adminErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('401')) {
    return '管理APIが認証を拒否しました。Renderの再デプロイ後に、My PageでMinecraft IDがyousotu_neetになっているか確認して、Discordへ再ログインしてください。'
  }
  return message || '操作に失敗しました。'
}
</script>

<template>
  <PageHero
    v-if="authorized"
    eyebrow="Admin Console"
    title="運営の判断を、すぐ大会に反映する。"
    description="Minecraft ID yousotu_neet 専用の管理画面。イベント、ポイント、ニュース、処分、通知を操作します。"
  />
  <PageHero
    v-else
    eyebrow="Admin Locked"
    title="管理画面は主催者専用です。"
    :description="`Minecraft ID ${serverRequiredMcid} と連携したDiscordアカウントのみアクセスできます。`"
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
      <p class="mt-4 leading-8 text-slate-300">現在のDiscordアカウントは、管理者Minecraft IDと連携されていません。</p>
      <p v-if="linkedMcid" class="mt-4 rounded-2xl bg-white/8 p-4 text-sm font-bold text-slate-300">現在の連携ID: {{ linkedMcid }}</p>
      <p class="mt-3 rounded-2xl bg-white/8 p-4 text-sm font-bold text-slate-300">
        必要な連携ID: {{ serverRequiredMcid }} / サーバー許可: {{ serverAllowed ? 'OK' : 'NG' }}
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <RouterLink v-if="loadFailed" class="btn-primary" to="/login">Discordでログイン</RouterLink>
        <RouterLink v-else class="btn-primary" to="/my-page">My Pageで連携を確認</RouterLink>
        <button class="btn-secondary" type="button" @click="logout">ログアウト</button>
        <RouterLink class="btn-ghost" to="/">Homeへ戻る</RouterLink>
      </div>
    </div>
  </section>

  <section v-else class="section-shell grid gap-6 pb-24 xl:grid-cols-[340px_1fr]">
    <aside class="grid gap-3 self-start">
      <button class="btn-secondary w-full justify-center" type="button" @click="logout">ログアウト</button>
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="glass rounded-3xl p-5 text-left transition hover:-translate-y-1 hover:shadow-neon"
        :class="activeTool === tool.id ? 'border-[#E6FF0A]/70 bg-[#E6FF0A]/12' : ''"
        type="button"
        @click="activeTool = tool.id"
      >
        <component :is="tool.icon" class="text-cyan-200" :size="28" />
        <h2 class="mt-3 text-xl font-black">{{ tool.label }}</h2>
        <p class="mt-2 text-sm leading-6 text-slate-300">{{ tool.body }}</p>
      </button>
    </aside>

    <div class="grid gap-5">
      <div v-if="statusMessage || errorMessage" class="rounded-3xl border p-4 text-sm font-bold" :class="errorMessage ? 'border-orange-300/30 bg-orange-300/15 text-orange-100' : 'border-cyan-300/30 bg-cyan-300/15 text-cyan-100'">
        {{ errorMessage || statusMessage }}
      </div>

      <form v-if="activeTool === 'events'" class="glass grid gap-5 rounded-3xl p-6" @submit.prevent="startEvent">
        <div>
          <p class="eyebrow">Event Control</p>
          <h2 class="mt-2 text-3xl font-black">イベント設定</h2>
        </div>
        <label class="grid gap-2 text-sm font-bold">
          Event Type
          <select v-model="eventType" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none">
            <option v-for="type in eventTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
        </label>
        <label class="grid gap-2 text-sm font-bold">
          Message / Payload
          <textarea v-model="eventMessage" class="min-h-28 rounded-2xl border border-[#275382]/15 bg-white px-4 py-3 text-[#153C66] outline-none" />
        </label>
        <label class="grid gap-2 text-sm font-bold">
          Running Event ID
          <input v-model.trim="eventId" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" />
        </label>
        <div class="flex flex-wrap gap-3">
          <button class="btn-primary" type="submit" :disabled="busy"><Play :size="18" />開始</button>
          <button class="btn-secondary" type="button" :disabled="busy || !eventId" @click="endEvent"><Square :size="18" />終了</button>
        </div>
      </form>

      <form v-else-if="activeTool === 'ranking'" class="glass grid gap-5 rounded-3xl p-6" @submit.prevent="updatePoint">
        <div>
          <p class="eyebrow">Point Control</p>
          <h2 class="mt-2 text-3xl font-black">ランキング操作</h2>
        </div>
        <label class="grid gap-2 text-sm font-bold">
          Player UUID
          <input v-model.trim="pointTarget" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" />
        </label>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="grid gap-2 text-sm font-bold">
            Action
            <select v-model="pointAction" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none">
              <option value="add">加算</option>
              <option value="remove">減算</option>
            </select>
          </label>
          <label class="grid gap-2 text-sm font-bold">
            Amount
            <input v-model.number="pointAmount" min="1" type="number" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" />
          </label>
        </div>
        <label class="grid gap-2 text-sm font-bold">
          Reason
          <input v-model.trim="pointReason" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" />
        </label>
        <button class="btn-primary w-fit" type="submit" :disabled="busy || !pointTarget"><Plus v-if="pointAction === 'add'" :size="18" /><Minus v-else :size="18" />反映</button>
      </form>

      <form v-else-if="activeTool === 'news'" class="glass grid gap-5 rounded-3xl p-6" @submit.prevent="publishNews">
        <div>
          <p class="eyebrow">News Editor</p>
          <h2 class="mt-2 text-3xl font-black">ニュース投稿</h2>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="grid gap-2 text-sm font-bold">Title<input v-model.trim="newsTitle" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" /></label>
          <label class="grid gap-2 text-sm font-bold">Category<input v-model.trim="newsCategory" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" /></label>
        </div>
        <label class="grid gap-2 text-sm font-bold">Excerpt<input v-model.trim="newsExcerpt" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" /></label>
        <label class="grid gap-2 text-sm font-bold">Markdown<textarea v-model="newsMarkdown" class="min-h-48 rounded-2xl border border-[#275382]/15 bg-white px-4 py-3 text-[#153C66] outline-none" /></label>
        <button class="btn-primary w-fit" type="submit" :disabled="busy || !newsTitle">投稿</button>
      </form>

      <form v-else-if="activeTool === 'search'" class="glass grid gap-5 rounded-3xl p-6" @submit.prevent="searchAdmin">
        <div>
          <p class="eyebrow">Participant Lookup</p>
          <h2 class="mt-2 text-3xl font-black">プレイヤー検索</h2>
        </div>
        <label class="grid gap-2 text-sm font-bold">Search<input v-model.trim="searchQuery" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" /></label>
        <button class="btn-primary w-fit" type="submit" :disabled="busy || !searchQuery"><Search :size="18" />検索</button>
        <div class="grid gap-4 lg:grid-cols-2">
          <div class="rounded-3xl bg-white/8 p-5">
            <h3 class="text-xl font-black">Players</h3>
            <p v-for="player in foundPlayers" :key="player.uuid" class="mt-3 break-all rounded-2xl bg-white/8 p-3 text-sm">{{ player.name }} / {{ player.uuid }} / {{ player.points.toLocaleString() }}pt</p>
          </div>
          <div class="rounded-3xl bg-white/8 p-5">
            <h3 class="text-xl font-black">Teams</h3>
            <p v-for="team in foundTeams" :key="team.id" class="mt-3 break-all rounded-2xl bg-white/8 p-3 text-sm">{{ team.name }} / {{ team.id }} / {{ team.points.toLocaleString() }}pt</p>
          </div>
        </div>
      </form>

      <form v-else-if="activeTool === 'ban'" class="glass grid gap-5 rounded-3xl p-6" @submit.prevent="submitBan">
        <div>
          <p class="eyebrow">Moderation</p>
          <h2 class="mt-2 text-3xl font-black">BAN / 失格</h2>
        </div>
        <label class="grid gap-2 text-sm font-bold">Target UUID / MCID<input v-model.trim="banTarget" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" /></label>
        <label class="grid gap-2 text-sm font-bold">
          Type
          <select v-model="banType" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none">
            <option value="disqualify">失格</option>
            <option value="ban">BAN</option>
          </select>
        </label>
        <label class="grid gap-2 text-sm font-bold">Reason<textarea v-model="banReason" class="min-h-28 rounded-2xl border border-[#275382]/15 bg-white px-4 py-3 text-[#153C66] outline-none" /></label>
        <label class="inline-flex items-center gap-3 text-sm font-bold"><input v-model="banNotifyDiscord" type="checkbox" />Discord通知</label>
        <button class="btn-primary w-fit" type="submit" :disabled="busy || !banTarget">記録</button>
      </form>

      <form v-else class="glass grid gap-5 rounded-3xl p-6" @submit.prevent="sendNotification">
        <div>
          <p class="eyebrow">Broadcast</p>
          <h2 class="mt-2 text-3xl font-black">Discord通知</h2>
        </div>
        <label class="grid gap-2 text-sm font-bold">Title<input v-model.trim="notifyTitle" class="min-h-12 rounded-2xl border border-[#275382]/15 bg-white px-4 text-[#153C66] outline-none" /></label>
        <label class="grid gap-2 text-sm font-bold">Message<textarea v-model="notifyMessage" class="min-h-36 rounded-2xl border border-[#275382]/15 bg-white px-4 py-3 text-[#153C66] outline-none" /></label>
        <button class="btn-primary w-fit" type="submit" :disabled="busy || !notifyTitle"><Bell :size="18" />送信</button>
      </form>
    </div>
  </section>
</template>
