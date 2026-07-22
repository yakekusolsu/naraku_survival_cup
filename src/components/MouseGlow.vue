<script setup lang="ts">
import { onMounted, ref } from 'vue'

const x = ref(50)
const y = ref(50)

onMounted(() => {
  window.addEventListener('pointermove', (event) => {
    x.value = (event.clientX / window.innerWidth) * 100
    y.value = (event.clientY / window.innerHeight) * 100
  })
})
</script>

<template>
  <div
    class="pointer-events-none fixed inset-0 z-[1] opacity-70"
    :style="{ background: `radial-gradient(circle at ${x}% ${y}%, rgba(0,229,255,.16), transparent 22rem)` }"
    aria-hidden="true"
  />
</template>
