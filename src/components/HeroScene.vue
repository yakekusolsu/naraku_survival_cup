<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

const canvas = ref<HTMLCanvasElement | null>(null)
let renderer: THREE.WebGLRenderer | undefined
let frame = 0

onMounted(() => {
  if (!canvas.value) return
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 1.2, 7)
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const geometry = new THREE.BufferGeometry()
  const count = 420
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  for (let index = 0; index < count; index++) {
    positions[index * 3] = (Math.random() - 0.5) * 14
    positions[index * 3 + 1] = (Math.random() - 0.5) * 5
    positions[index * 3 + 2] = (Math.random() - 0.5) * 8
    const cyan = Math.random() > 0.28
    colors[index * 3] = cyan ? 0 : 1
    colors[index * 3 + 1] = cyan ? 0.82 : 0.42
    colors[index * 3 + 2] = cyan ? 1 : 0.18
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const material = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.9 })
  const points = new THREE.Points(geometry, material)
  scene.add(points)

  const grid = new THREE.GridHelper(16, 24, '#00cfff', '#00cfff')
  grid.position.y = -2.2
  grid.material.transparent = true
  grid.material.opacity = 0.16
  scene.add(grid)

  const resize = () => {
    if (!renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', resize)

  const tick = () => {
    frame = requestAnimationFrame(tick)
    const time = performance.now() * 0.00025
    points.rotation.y = time
    points.rotation.x = Math.sin(time * 1.6) * 0.08
    grid.position.z = (time * 14) % 1
    renderer?.render(scene, camera)
  }
  tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  renderer?.dispose()
})
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-80" aria-hidden="true" />
</template>
