<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { gsap } from 'gsap'
import { CalendarDays, Crown, Flame, Radio, Shield, Swords, Trophy, Users, Waves, Zap } from '@lucide/vue'
import HeroScene from '@/components/HeroScene.vue'
import ParticleField from '@/components/ParticleField.vue'
import RankingTable from '@/components/RankingTable.vue'
import StatCard from '@/components/StatCard.vue'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()

const features = [
  { label: '略奪OK', icon: Swords, body: 'ポイント、物資、拠点。奪えるものは全部戦略資源。' },
  { label: '同盟OK', icon: Shield, body: '外交は自由。守る約束も、破る瞬間も大会の一部。' },
  { label: '裏切りOK', icon: Flame, body: '最終日に笑うのは、最後まで信じ切らなかった者かもしれない。' },
  { label: 'チーム自由', icon: Users, body: 'ソロ、少人数、巨大勢力。途中加入と脱退にも対応。' },
  { label: '優勝賞品あり', icon: Trophy, body: '1位にはAmazon Gift Card 1,500円分をプレゼント。順位変動も配信映え。' },
  { label: 'リアルタイム順位', icon: Radio, body: 'Plugin、WebSocket、公式サイトがランキングを同期。' },
]

onMounted(() => {
  gsap.from('.hero-reveal', {
    y: 28,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: 'power3.out',
  })
})
</script>

<template>
  <section class="relative min-h-[calc(100vh+80px)] overflow-hidden pt-28">
    <img src="/hero-summer-2026.png" alt="" class="absolute inset-0 h-full w-full object-cover opacity-55" fetchpriority="high" />
    <div class="absolute inset-0 bg-gradient-to-b from-[#e7fbffcc] via-[#83d7ff55] to-[#dff6ff]" />
    <div class="absolute inset-0 scanline opacity-15" />
    <HeroScene />
    <ParticleField />

    <div class="section-shell relative z-20 flex min-h-[calc(100vh-80px)] items-center">
      <div class="max-w-5xl pb-28">
        <p class="hero-reveal eyebrow">Official Tournament Site / Summer 2026</p>
        <h1 class="hero-reveal mt-5 max-w-5xl text-5xl font-black leading-[0.95] tracking-wide md:text-8xl">
          奈落鯖<br />
          <span class="title-gradient">サバイバルカップ</span>
        </h1>
        <p class="hero-reveal mt-5 text-2xl font-black tracking-[0.12em] text-[#FF8A00] md:text-4xl">Summer 2026</p>
        <p class="hero-reveal mt-6 max-w-2xl text-xl font-black leading-9 text-[#153C66] md:text-3xl">“裏切るか、奪われるか。”</p>
        <div class="hero-reveal mt-8 flex flex-wrap gap-3">
          <RouterLink to="/login" class="btn-primary">今すぐ参加</RouterLink>
          <RouterLink to="/ranking" class="btn-secondary">ランキングを見る</RouterLink>
          <a :href="store.overview.discordUrl" class="btn-ghost">Discord</a>
          <RouterLink to="/rules" class="btn-ghost">ルール</RouterLink>
        </div>
      </div>
    </div>
    <div class="wave-layer z-20" />
  </section>

  <section class="section-shell relative z-30 grid gap-4 pb-20 pt-10 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard label="開催日" :value="new Date(store.overview.startsAt).toLocaleDateString('ja-JP')" caption="JST / 20:00 Opening" :icon="CalendarDays" />
    <StatCard label="優勝賞品" value="Amazon Gift Card" caption="1,500円分 / 1位に贈呈" :icon="Crown" tone="orange" />
    <StatCard label="参加人数" :value="`${store.overview.participants}/${store.overview.maxParticipants}`" caption="最大100人 / 先着登録" :icon="Users" />
    <StatCard label="マップ" value="10,000 x 10,000" caption="通常ワールドで開催" :icon="Waves" tone="orange" />
  </section>

  <section class="section-shell grid gap-8 pb-20 lg:grid-cols-[.85fr_1.15fr]">
    <div>
      <p class="eyebrow">Event Identity</p>
      <h2 class="title-gradient mt-4 text-4xl font-black md:text-6xl">夏の終わり、信頼が資源になる。</h2>
      <p class="mt-5 leading-8 text-slate-300">
        NSC Summer 2026 は、最大100人で開催される7日間の大型サバイバルイベントです。夏の海岸ワールドで、探索、外交、略奪、最終決戦が交差します。
        PvP、略奪、同盟、裏切り、配信、ランキング更新まで、すべてがドラマになるように設計されています。
      </p>
      <div class="mt-6 flex flex-wrap gap-2 text-sm font-black">
        <span class="rounded-full bg-[#E6FF0A]/60 px-4 py-2 text-[#153C66]">主催者: よーそつにぃと</span>
        <span class="rounded-full bg-[#83D7FF]/45 px-4 py-2 text-[#153C66]">Powered by 奈落鯖</span>
      </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <article v-for="feature in features" :key="feature.label" class="glass rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-neon">
        <component :is="feature.icon" class="mb-4 text-cyan-200" :size="28" />
        <h3 class="text-xl font-black">{{ feature.label }}</h3>
        <p class="mt-2 text-sm leading-7 text-slate-300">{{ feature.body }}</p>
      </article>
    </div>
  </section>

  <section class="section-shell grid gap-8 pb-20 lg:grid-cols-[1.1fr_.9fr]">
    <RankingTable :players="store.rankings.slice(0, 8)" compact />
    <div class="glass rounded-3xl p-6">
      <p class="eyebrow">Live Operations</p>
      <h2 class="mt-3 text-3xl font-black">Plugin → REST → Node → Vue</h2>
      <div class="mt-6 grid gap-4">
        <div v-for="step in ['Paper Plugin', 'REST API', 'Node.js BFF', 'Socket.IO', 'Vue Dashboard']" :key="step" class="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/6 p-4">
          <span class="grid h-10 w-10 place-items-center rounded-full bg-cyan-300/15 text-cyan-100"><Zap :size="18" /></span>
          <span class="font-black">{{ step }}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section-shell pb-24">
    <div class="glass relative overflow-hidden rounded-[2rem] p-8 md:p-12">
      <div class="absolute inset-0 bg-nsc-radial opacity-80" />
      <div class="relative z-10 max-w-3xl">
        <p class="eyebrow">Final Call</p>
        <h2 class="mt-4 text-4xl font-black md:text-6xl">同盟は、最後の一撃まで信用するな。</h2>
        <p class="mt-5 leading-8 text-slate-300">参加登録、Discord連携、ランキング確認、ルール確認をこのサイトから一気通貫で行えます。</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink to="/login" class="btn-primary">参加登録へ</RouterLink>
          <RouterLink to="/schedule" class="btn-ghost">日程を見る</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
