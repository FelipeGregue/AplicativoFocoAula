<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BookOpen, CalendarDays, ClipboardList, Clock3, GraduationCap, Home } from '@lucide/vue'
import AppHeader from '../components/AppHeader.vue'
import BottomNav from '../components/BottomNav.vue'
import { useFocoAula } from '../composables/useFocoAula'
import type { NavTab, Tab } from '../types'

const route = useRoute()
const router = useRouter()
const { apiStatus, initSession, logout, stopPomodoroTimer, user } = useFocoAula()

const tabs: NavTab[] = [
  { id: 'painel', label: 'Painel', icon: Home },
  { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
  { id: 'tarefas', label: 'Tarefas', icon: ClipboardList },
  { id: 'calendario', label: 'Agenda', icon: CalendarDays },
  { id: 'notas', label: 'Notas', icon: GraduationCap },
  { id: 'pomodoro', label: 'Foco', icon: Clock3 },
]

const activeTab = computed<Tab | null>(() => {
  const routeName = String(route.name ?? '')
  return tabs.some((tab) => tab.id === routeName) ? (routeName as Tab) : null
})

onMounted(() => {
  void initSession()
})

onUnmounted(() => {
  stopPomodoroTimer()
})

function navigateToSettings() {
  if (route.name !== 'configuracoes') void router.push({ name: 'configuracoes' })
}
</script>

<template>
  <main v-if="user" class="app-shell">
    <AppHeader :user="user" :api-status="apiStatus" @settings="navigateToSettings" @logout="logout" />
    <RouterView />
    <BottomNav :tabs="tabs" :active-tab="activeTab" />
  </main>
</template>
