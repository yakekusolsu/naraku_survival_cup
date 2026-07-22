<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <section class="relative overflow-hidden pt-36">
    <div class="absolute inset-0 -z-10 bg-nsc-radial" />
    <div class="section-shell pb-12">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 class="title-gradient mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">{{ title }}</h1>
      <p class="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">{{ description }}</p>
    </div>
  </section>
</template>
