<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { GitBranch, Radio, Shield } from '@lucide/vue'
</script>

<template>
  <footer class="border-t border-[#2753821f] bg-[#275382] py-12 text-white">
    <div class="section-shell grid gap-8 md:grid-cols-[1.3fr_.7fr_.7fr]">
      <div>
        <div class="mb-4 flex items-center gap-3">
          <span class="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300 text-slate-950 shadow-neon"><Shield :size="22" /></span>
          <div>
            <p class="font-black tracking-[0.2em]">NSC SUMMER 2026</p>
            <p class="text-sm text-white/75">大型サバイバル大会公式サイト</p>
          </div>
        </div>
        <p class="max-w-xl text-sm leading-7 text-white/75">
          Minecraft を土台にしながら、見た目も体験も夏の大型イベントとして成立する公式サイト。Paper Plugin、Node.js BFF、Vue.js frontend をリアルタイム同期します。
        </p>
        <div class="mt-5 flex flex-wrap gap-2 text-xs font-black">
          <span class="rounded-full bg-white/10 px-3 py-1 text-cyan-100">主催者: よーそつにぃと</span>
          <span class="rounded-full bg-white/10 px-3 py-1 text-orange-100">Powered by 奈落鯖</span>
        </div>
      </div>
      <div>
        <p class="mb-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Operations</p>
        <p class="text-sm leading-7 text-white/75">大会情報とリアルタイム連携を運営中。</p>
      </div>
      <div>
        <p class="mb-3 text-xs font-black uppercase tracking-[0.2em] text-orange-200">Live Stack</p>
        <div class="grid gap-2 text-sm text-white/75">
          <span class="inline-flex items-center gap-2"><Radio :size="14" /> WebSocket / Socket.IO</span>
          <span>Paper 1.21.x + Java 21</span>
          <span>Vue 3 + Express</span>
        </div>
      </div>
    </div>
    <div class="section-shell mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55">
      <span>© 2026 Naraku Survival Cup. 主催者: よーそつにぃと / Powered by 奈落鯖</span>
      <span class="inline-flex items-center gap-2"><GitBranch :size="14" /> Production-ready starter</span>
    </div>
  </footer>
</template>
