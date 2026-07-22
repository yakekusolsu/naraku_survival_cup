import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/pages/Home.vue'
import Rules from '@/pages/Rules.vue'
import Schedule from '@/pages/Schedule.vue'
import Ranking from '@/pages/Ranking.vue'
import Teams from '@/pages/Teams.vue'
import Players from '@/pages/Players.vue'
import News from '@/pages/News.vue'
import MapPage from '@/pages/Map.vue'
import Shop from '@/pages/Shop.vue'
import Login from '@/pages/Login.vue'
import MyPage from '@/pages/MyPage.vue'
import Admin from '@/pages/Admin.vue'
import ApiDocs from '@/pages/ApiDocs.vue'
import NotFound from '@/pages/NotFound.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Home },
  { path: '/rules', name: 'rules', component: Rules },
  { path: '/schedule', name: 'schedule', component: Schedule },
  { path: '/ranking', name: 'ranking', component: Ranking },
  { path: '/teams', name: 'teams', component: Teams },
  { path: '/players', name: 'players', component: Players },
  { path: '/news', name: 'news', component: News },
  { path: '/map', name: 'map', component: MapPage },
  { path: '/shop', name: 'shop', component: Shop },
  { path: '/login', name: 'login', component: Login },
  { path: '/my-page', name: 'my-page', component: MyPage },
  { path: '/admin', name: 'admin', component: Admin },
  { path: '/api-docs', name: 'api-docs', component: ApiDocs },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})
