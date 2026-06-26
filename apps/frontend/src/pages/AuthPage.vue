<script setup lang="ts">
import LogoMark from '../components/LogoMark.vue'
import { useFocoAula } from '../composables/useFocoAula'

const { authForm, authMode, loading, message, submitAuth } = useFocoAula()
</script>

<template>
  <main class="splash-shell">
    <section class="splash-panel">
      <LogoMark />
      <p>Registre e gerencie suas atividades academicas</p>
    </section>

    <form class="auth-panel" @submit.prevent="submitAuth">
      <div>
        <h1>{{ authMode === 'login' ? 'Entrar no FocoAula' : 'Criar sua conta' }}</h1>
        <p>Uma solução acadêmica para tarefas, provas, foco e notas.</p>
      </div>
      <label v-if="authMode === 'register'">
        Nome
        <input v-model="authForm.name" autocomplete="name" required />
      </label>
      <label>
        E-mail
        <input v-model="authForm.email" autocomplete="email" required type="email" />
      </label>
      <label>
        Senha
        <input v-model="authForm.password" autocomplete="current-password" required type="password" minlength="6" />
      </label>
      <button class="primary-action" :disabled="loading">
        {{ loading ? 'Aguarde...' : authMode === 'login' ? 'Entrar' : 'Cadastrar' }}
      </button>
      <button
        class="ghost-action"
        type="button"
        @click="authMode = authMode === 'login' ? 'register' : 'login'"
      >
        {{ authMode === 'login' ? 'Criar nova conta' : 'Ja tenho conta' }}
      </button>
      <p v-if="message" class="form-message">{{ message }}</p>
    </form>
  </main>
</template>
