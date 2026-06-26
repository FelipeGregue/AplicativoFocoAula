<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LogoMark from '../components/LogoMark.vue'
import { defaultRoute } from '../router'
import { readLocal } from '../utils/storage'

const router = useRouter()
let redirectTimer: number | undefined

onMounted(() => {
  redirectTimer = window.setTimeout(() => {
    const hasUser = Boolean(readLocal('focoaula.user', null))
    void router.replace({ name: hasUser ? defaultRoute : 'login' })
  }, 1600)
})

onBeforeUnmount(() => {
  if (redirectTimer) window.clearTimeout(redirectTimer)
})
</script>

<template>
  <main class="startup-splash" aria-label="Carregando FocoAula">
    <LogoMark />
    <p>Registre e gerencie suas atividades acadêmicas</p>
    <div class="startup-loader" aria-hidden="true"></div>
  </main>
</template>
