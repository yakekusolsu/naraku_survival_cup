<script setup lang="ts">
import { computed, ref } from 'vue'
import { Crosshair, Shield, ShoppingCart, Sparkles, Swords, Timer, Users, Zap } from '@lucide/vue'
import PageHero from '@/components/PageHero.vue'
import { nscApi } from '@/services/api'
import { useTournamentStore } from '@/stores/tournament'
import type { ShopItem } from '@/types'

const store = useTournamentStore()
const activeCategory = ref('All')
const purchaseMessage = ref('')
const purchaseError = ref('')
const purchasingItemId = ref<string | null>(null)

const targetLabels: Record<ShopItem['target'], string> = {
  self: '自分',
  team: '自チーム',
  enemy_team: '敵チーム',
  enemy_player: '敵プレイヤー',
  world: 'ワールド',
}

const targetIcons = {
  self: Zap,
  team: Users,
  enemy_team: Swords,
  enemy_player: Crosshair,
  world: Sparkles,
}

const targetClass = (target: ShopItem['target']) => {
  if (target === 'enemy_team' || target === 'enemy_player') {
    return 'border-orange-300/30 bg-orange-300/15 text-orange-100'
  }

  if (target === 'world') {
    return 'border-[#275382]/20 bg-[#E6FF0A]/40 text-[#153C66]'
  }

  return 'border-cyan-300/30 bg-cyan-300/15 text-cyan-100'
}

const categories = computed(() => ['All', ...Array.from(new Set(store.shop.map((item) => item.category)))])
const filteredShop = computed(() => (activeCategory.value === 'All' ? store.shop : store.shop.filter((item) => item.category === activeCategory.value)))

async function purchase(item: ShopItem) {
  purchaseMessage.value = ''
  purchaseError.value = ''
  purchasingItemId.value = item.id

  try {
    const targetId = item.requiresTarget ? window.prompt(targetPrompt(item))?.trim() : undefined
    if (item.requiresTarget && !targetId) {
      purchaseError.value = '対象を入力してください。'
      return
    }

    const result = await nscApi.purchaseShop({
      itemId: item.id,
      targetId,
    })
    const balance = typeof result.purchase.balanceAfter === 'number' ? ` 残高: ${result.purchase.balanceAfter.toLocaleString()}pt` : ''
    purchaseMessage.value = `${result.purchase.name} を購入しました。${balance}`
  } catch (error) {
    purchaseError.value = messageForPurchaseError(error)
  } finally {
    purchasingItemId.value = null
  }
}

function targetPrompt(item: ShopItem) {
  if (item.target === 'enemy_player') {
    return '対象プレイヤー名またはUUIDを入力してください。'
  }

  return '対象チーム名またはチームUUIDを入力してください。'
}

function messageForPurchaseError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('401')) {
    return 'Discordログインが必要です。Loginからログインしてください。'
  }
  if (message.includes('minecraft_link_required')) {
    return 'My PageでMinecraft IDを連携してから購入してください。'
  }
  if (message.includes('plugin_shop_purchase_failed') || message.includes('502')) {
    if (message.includes('plugin_rest_unauthorized')) {
      return 'プラグインRESTの認証に失敗しています。RenderのPLUGIN_REST_TOKENとweb.ymlのauth-tokenを一致させてください。'
    }
    if (message.includes('plugin_rest_unreachable')) {
      return 'RenderからMinecraftサーバーのREST APIへ接続できません。IP、ポート8080、ファイアウォール、トンネル設定を確認してください。'
    }
    if (message.includes('Buyer player is not registered')) {
      return 'Minecraftサーバーに一度参加してから購入してください。連携IDとゲーム内IDも確認してください。'
    }
    if (message.includes('Not enough points')) {
      return 'ポイントが足りません。'
    }
    if (message.includes('No online team members') || message.includes('team.not-in-team')) {
      return 'チーム所属またはオンライン状態が必要です。ゲーム内でチームに参加してから試してください。'
    }
    if (message.includes('Buyer must be online')) {
      return '購入者がMinecraftサーバーにオンラインの状態で購入してください。'
    }
    if (message.includes('Shop item is on cooldown')) {
      return 'この商品はクールダウン中です。時間をおいて再試行してください。'
    }
    if (message.includes('Unknown shop item')) {
      return 'サイトとプラグインのshop.ymlが一致していません。最新jarと設定ファイルを確認してください。'
    }
    return 'プラグインへの送信に失敗しました。サーバー接続、ポイント残高、チーム状態を確認してください。'
  }
  return '購入に失敗しました。ブラウザで失敗する場合はゲーム内 /nsc shop を使用してください。'
}
</script>

<template>
  <PageHero eyebrow="Shop / Plugin Linked" title="ポイントで戦況を買う。" description="基本は Minecraft サーバー内の /nsc shop。ブラウザからもログイン連携済みなら購入を試せます。" />
  <section class="section-shell pb-24">
    <div class="glass mb-6 grid gap-4 rounded-3xl p-5 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p class="eyebrow">Paper Plugin Sync</p>
        <h2 class="mt-2 text-2xl font-black">ゲーム内GUIとブラウザ購入の両対応</h2>
        <p class="mt-2 leading-7 text-slate-300">
          安定運用は <span class="font-black text-cyan-100">/nsc shop</span> 推奨。サイト購入はDiscordログイン、Minecraft ID連携、サーバー接続が揃っている場合にプラグインへ送信されます。
        </p>
      </div>
      <div class="rounded-2xl border border-[#275382]/15 bg-[#E6FF0A]/45 px-5 py-4 text-center font-black text-[#153C66]">
        /api/shop/purchase
      </div>
    </div>

    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category"
        class="rounded-full border border-[#275382]/15 px-4 py-2 text-sm font-black transition hover:bg-[#83D7FF]/25"
        :class="activeCategory === category ? 'bg-[#E6FF0A] text-[#153C66] shadow-[0_5px_0_rgba(21,60,102,.12)]' : 'bg-white/60 text-[#275382]'"
        type="button"
        @click="activeCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <div v-if="purchaseMessage || purchaseError" class="mb-6 rounded-3xl border p-4 text-sm font-bold" :class="purchaseError ? 'border-orange-300/30 bg-orange-300/15 text-orange-100' : 'border-cyan-300/30 bg-cyan-300/15 text-cyan-100'">
      {{ purchaseError || purchaseMessage }}
    </div>

    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <article v-for="item in filteredShop" :key="item.id" class="glass flex min-h-[360px] flex-col rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-neon">
        <div class="flex items-start justify-between gap-4">
          <p class="eyebrow">{{ item.category }}</p>
          <span class="rounded-full border px-3 py-1 text-xs font-black uppercase" :class="targetClass(item.target)">
            <component :is="targetIcons[item.target]" class="mr-1 inline" :size="13" />
            {{ targetLabels[item.target] }}
          </span>
        </div>

        <h2 class="mt-4 text-2xl font-black">{{ item.name }}</h2>
        <p class="mt-3 min-h-20 text-sm leading-7 text-slate-300">{{ item.description }}</p>

        <div class="mt-5 grid gap-2 text-sm">
          <div class="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
            <span class="inline-flex items-center gap-2 font-bold text-slate-300"><Shield :size="16" /> 効果</span>
            <span class="font-black">{{ item.effect }}</span>
          </div>
          <div class="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
            <span class="inline-flex items-center gap-2 font-bold text-slate-300"><Timer :size="16" /> 持続</span>
            <span class="font-black">{{ item.duration }}</span>
          </div>
          <div class="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
            <span class="font-bold text-slate-300">再購入</span>
            <span class="font-black">{{ item.cooldown }}</span>
          </div>
        </div>

        <div class="mt-auto pt-5">
          <div class="mb-4 flex items-center justify-between">
            <span class="rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1 text-xs font-black uppercase text-orange-100">{{ item.rarity }}</span>
            <span class="text-2xl font-black text-cyan-100">{{ item.price.toLocaleString() }} PP</span>
          </div>
          <button class="btn-primary w-full" type="button" :disabled="purchasingItemId === item.id" @click="purchase(item)">
            <ShoppingCart :size="18" />
            {{ purchasingItemId === item.id ? '送信中...' : item.requiresTarget ? '対象を入力して購入' : 'サイトから購入' }}
          </button>
          <p class="mt-3 text-center text-xs font-bold text-slate-300">ゲーム内購入: /nsc shop</p>
        </div>
      </article>
    </div>
  </section>
</template>
