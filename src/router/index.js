import { createRouter, createWebHistory } from 'vue-router'
import CombatView from '../views/CombatView.vue'
import TemplatesView from '../views/TemplatesView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/combat'
  },
  {
    path: '/combat',
    name: 'Combat',
    component: CombatView
  },
  {
    path: '/templates',
    name: 'Templates',
    component: TemplatesView
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router