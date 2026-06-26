<script setup lang="ts">
import { LogOut, Settings } from '@lucide/vue'
import type { ApiStatus, User } from '../types'

defineProps<{
  user: User
  apiStatus: ApiStatus
}>()

defineEmits<{
  settings: []
  logout: []
}>()
</script>

<template>
  <header class="app-header">
    <div>
      <span class="eyebrow">FocoAula</span>
      <h1>Oi, {{ user.name.split(' ')[0] }}</h1>
    </div>
    <div class="header-actions">
      <button class="icon-button" title="Configuracoes" @click="$emit('settings')">
        <Settings :size="20" />
      </button>
      <button class="icon-button" title="Sair" @click="$emit('logout')">
        <LogOut :size="20" />
      </button>
    </div>
  </header>
</template>
