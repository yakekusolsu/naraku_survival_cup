<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string | number
  caption: string
  icon?: Component
  tone?: 'cyan' | 'orange'
}>()
</script>

<template>
  <article class="glass neon-border flex min-h-[230px] flex-col rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-neon">
    <div class="mb-5 flex items-center justify-between">
      <div class="grid h-11 w-11 place-items-center rounded-2xl" :class="tone === 'orange' ? 'bg-orange-400/18 text-orange-200' : 'bg-cyan-300/18 text-cyan-200'">
        <component :is="icon" v-if="icon" :size="22" />
      </div>
      <span class="rounded-full bg-[#E6FF0A] px-2 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#153C66]">NSC</span>
    </div>
    <div class="mt-auto">
      <p class="text-sm font-black text-[#275382]">{{ label }}</p>
      <p class="mt-2 break-words text-[clamp(1.9rem,2.4vw,2.8rem)] font-black leading-tight tracking-wide text-white">
        {{ value }}
      </p>
      <p class="mt-3 text-sm font-bold leading-6 text-[#275382]/75">{{ caption }}</p>
    </div>
  </article>
</template>
