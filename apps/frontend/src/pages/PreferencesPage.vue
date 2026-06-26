<script setup lang="ts">
import { Bell } from '@lucide/vue'
import { useFocoAula } from '../composables/useFocoAula'

const { reminders, saveReminders } = useFocoAula()
</script>

<template>
  <section class="screen">
    <form class="composer" @submit.prevent="saveReminders">
      <h2>Configurações</h2>
      <label class="toggle-line">
        <input v-model="reminders.enabled" type="checkbox" />
        Notificações ativas
      </label>
      <label>
        Tempo Padrão de Notificação
        <input v-model.number="reminders.defaultMinutesBefore" type="number" min="0" max="10080" />
      </label>
      <div class="form-grid">
        <label>
          Início silêncio
          <input v-model="reminders.quietHoursStart" type="time" />
        </label>
        <label>
          Fim silêncio
          <input v-model="reminders.quietHoursEnd" type="time" />
        </label>
      </div>
      <button class="primary-action"><Bell :size="18" /> Salvar configuração</button>
    </form>
  </section>
</template>
