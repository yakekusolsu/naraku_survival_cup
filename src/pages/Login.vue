<script setup lang="ts">
import { Disc3, Link as LinkIcon, LockKeyhole } from '@lucide/vue'
import PageHero from '@/components/PageHero.vue'
</script>

<template>
  <PageHero eyebrow="Login / Discord OAuth" title="Discord と Minecraft を接続する。" description="本番では Discord OAuth、Minecraft ID、LuckPerms 権限、参加状態を結びます。" />
  <section class="section-shell grid gap-6 pb-24 lg:grid-cols-[.85fr_1.15fr]">
    <div class="glass rounded-3xl p-6">
      <h2 class="text-3xl font-black">Participant Login</h2>
      <p class="mt-3 leading-8 text-slate-300">Discord OAuth でログインし、Minecraft ID と連携します。認証後は My Page に戻ります。</p>
      <a class="btn-primary mt-6 w-full" href="/api/auth/discord/start"><Disc3 :size="20" /> Discordでログイン</a>
    </div>
    <div class="grid gap-4">
      <div class="glass flex items-center gap-4 rounded-3xl p-5"><LockKeyhole class="text-cyan-200" /><span class="font-bold">JWT + HttpOnly Cookie でセッション管理</span></div>
      <div class="glass flex items-center gap-4 rounded-3xl p-5"><LinkIcon class="text-orange-200" /><span class="font-bold">Minecraft ID / BE_付き統合版ID を連携</span></div>
      <div class="glass flex items-center gap-4 rounded-3xl p-5"><Disc3 class="text-cyan-200" /><span class="font-bold">Discord通知・大会連絡と統合</span></div>
    </div>
  </section>
</template>
