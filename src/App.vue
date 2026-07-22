<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { gsap } from 'gsap'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import MouseGlow from '@/components/MouseGlow.vue'
import LiveTicker from '@/components/LiveTicker.vue'
import { useTournamentStore } from '@/stores/tournament'

const route = useRoute()
const store = useTournamentStore()

onMounted(() => {
  store.hydrate()
  store.startRealtime()
  gsap.fromTo('.app-shell', { opacity: 0 }, { opacity: 1, duration: 0.75, ease: 'power2.out' })
})
</script>

<template>
  <div class="app-shell min-h-screen overflow-x-hidden bg-[#dff6ff] text-nsc-text">
    <MouseGlow />
    <SiteHeader />
    <LiveTicker />
    <main :key="route.fullPath" class="light-surface">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <SiteFooter />
  </div>
</template>
