<script setup lang="ts">
import { computed, ref } from 'vue'
import { Crosshair, Shield, ShoppingCart, Sparkles, Swords, Timer, Users, Zap } from '@lucide/vue'
import PageHero from '@/components/PageHero.vue'
import { useTournamentStore } from '@/stores/tournament'
import type { ShopItem } from '@/types'

const store = useTournamentStore()
const activeCategory = ref('All')

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
</script>

<template>
  <PageHero eyebrow="Shop / In-Game GUI" title="ポイントで戦況を買う。" description="購入は Minecraft サーバー内の /nsc shop から実行。サイトでは各スキルの効果と価格を確認できます。" />
  <section class="section-shell pb-24">
    <div class="glass mb-6 grid gap-4 rounded-3xl p-5 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p class="eyebrow">Paper Plugin GUI</p>
        <h2 class="mt-2 text-2xl font-black">購入はゲーム内GUIで即時決済</h2>
        <p class="mt-2 leading-7 text-slate-300">
          サーバーに参加して <span class="font-black text-cyan-100">/nsc shop</span> を開くと、PlayerPoints 残高から購入され、効果付与・クールダウン・通知までその場で反映されます。
        </p>
      </div>
      <div class="rounded-2xl border border-[#275382]/15 bg-[#E6FF0A]/45 px-5 py-4 text-center font-black text-[#153C66]">
        /nsc shop
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
          <div class="btn-primary w-full justify-center">
            <ShoppingCart :size="18" />
            ゲーム内 /nsc shop
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
