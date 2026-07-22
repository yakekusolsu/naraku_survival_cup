import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Lenis from 'lenis'
import App from './App.vue'
import { router } from './router'
import './styles/main.css'

const lenis = new Lenis({
  duration: 1.1,
  smoothWheel: true,
  wheelMultiplier: 0.92,
})

function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
