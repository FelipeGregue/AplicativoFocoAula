import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'
import AuthPage from '../pages/AuthPage.vue'
import CalendarPage from '../pages/CalendarPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import GradesPage from '../pages/GradesPage.vue'
import PomodoroPage from '../pages/PomodoroPage.vue'
import PreferencesPage from '../pages/PreferencesPage.vue'
import SettingsPage from '../pages/SettingsPage.vue'
import SplashPage from '../pages/SplashPage.vue'
import TasksPage from '../pages/TasksPage.vue'
import type { Tab } from '../types'
import { readLocal } from '../utils/storage'

export const defaultRoute: Tab = 'painel'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'splash', component: SplashPage },
  { path: '/login', name: 'login', component: AuthPage },
  {
    path: '/',
    component: AppShell,
    children: [
      { path: 'painel', name: 'painel', component: DashboardPage },
      { path: 'disciplinas', name: 'disciplinas', component: SettingsPage },
      { path: 'tarefas', name: 'tarefas', component: TasksPage },
      { path: 'calendario', name: 'calendario', component: CalendarPage },
      { path: 'notas', name: 'notas', component: GradesPage },
      { path: 'pomodoro', name: 'pomodoro', component: PomodoroPage },
      { path: 'configuracoes', name: 'configuracoes', component: PreferencesPage },
    ],
  },
  { path: '/ajustes', redirect: '/disciplinas' },
  { path: '/:pathMatch(.*)*', redirect: `/${defaultRoute}` },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const hasUser = Boolean(readLocal('focoaula.user', null))

  if (to.name === 'splash') return true
  if (to.name !== 'login' && !hasUser) return { name: 'login' }
  if (to.name === 'login' && hasUser) return { name: defaultRoute }

  return true
})
