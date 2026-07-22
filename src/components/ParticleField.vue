<template>
  <div class="particle-field" aria-hidden="true">
    <span
      v-for="index in 38"
      :key="index"
      :style="{
        left: `${(index * 23) % 100}%`,
        top: `${(index * 17) % 100}%`,
        '--duration': `${6 + (index % 8)}s`,
        '--drift': `${index % 2 === 0 ? 70 : -60}px`,
      }"
    />
  </div>
</template>
