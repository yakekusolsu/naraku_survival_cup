<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Menu, X, Radio } from '@lucide/vue'
import { nscApi } from '@/services/api'
import { useTournamentStore } from '@/stores/tournament'
import type { AuthUser } from '@/types'

const route = useRoute()
const store = useTournamentStore()
const open = ref(false)
const authUser = ref<AuthUser | null>(null)

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Rules', to: '/rules' },
  { label: 'Schedule', to: '/schedule' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Teams', to: '/teams' },
  { label: 'Players', to: '/players' },
  { label: 'News', to: '/news' },
  { label: 'Map', to: '/map' },
  { label: 'Shop', to: '/shop' },
  { label: 'API', to: '/api-docs' },
]

const statusText = computed(() => (store.rankings.length > 0 ? 'LIVE SYNC' : 'PLUGIN待機'))
const accountLink = computed(() => (authUser.value ? '/my-page' : '/login'))
const accountLabel = computed(() => (authUser.value ? 'My Page' : 'Login'))

onMounted(async () => {
  try {
    authUser.value = (await nscApi.authMe()).user
  } catch {
    authUser.value = null
  }
})
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-[#2753821f] bg-[#ffffffe8] text-[#153C66] backdrop-blur-2xl">
    <div class="mx-auto flex h-16 w-[min(1220px,calc(100%-24px))] items-center justify-between gap-4">
      <RouterLink to="/" class="group flex items-center gap-3" aria-label="NSC Summer home">
        <img src="/icon.png" alt="" class="h-12 w-12 rounded-[1.2rem] object-cover shadow-[0_6px_0_rgba(21,60,102,.12)]" />
        <span class="leading-tight">
          <span class="block text-sm font-black tracking-[0.18em]">NSC</span>
          <span class="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#275382]/80">Summer 2026</span>
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="rounded-full px-3 py-2 text-xs font-black uppercase tracking-wide text-[#275382] transition hover:bg-[#83D7FF]/30"
          :class="route.path === item.to ? 'bg-[#E6FF0A] text-[#153C66] shadow-[0_5px_0_rgba(21,60,102,.12)]' : ''"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <span class="inline-flex items-center gap-2 rounded-full border border-[#2753821f] bg-[#83D7FF]/25 px-3 py-2 text-xs font-black text-[#153C66]">
          <Radio :size="14" class="animate-pulse" />
          {{ statusText }}
        </span>
        <RouterLink :to="accountLink" class="btn-primary !min-h-10 !px-4 !py-2 text-sm">{{ accountLabel }}</RouterLink>
      </div>

      <button class="grid h-11 w-11 place-items-center rounded-full border border-[#2753821f] bg-white lg:hidden" type="button" @click="open = !open" aria-label="Open menu">
        <X v-if="open" :size="22" />
        <Menu v-else :size="22" />
      </button>
    </div>

    <Transition name="page">
      <nav v-if="open" class="border-t border-[#2753821f] bg-white p-4 lg:hidden" aria-label="Mobile navigation">
        <div class="grid grid-cols-2 gap-2">
          <RouterLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="rounded-2xl border border-[#2753821f] bg-[#83D7FF]/15 px-4 py-3 text-sm font-bold"
            @click="open = false"
          >
            {{ item.label }}
          </RouterLink>
        </div>
        <RouterLink :to="accountLink" class="btn-primary mt-3 w-full" @click="open = false">{{ accountLabel }}</RouterLink>
      </nav>
    </Transition>
  </header>
</template>
