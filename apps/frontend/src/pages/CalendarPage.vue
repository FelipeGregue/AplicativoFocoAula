<script setup lang="ts">
import { CalendarDays, Trash2 } from '@lucide/vue'
import { useFocoAula } from '../composables/useFocoAula'

const {
  createEvent,
  deleteEvent,
  eventForm,
  eventMessage,
  eventRequiresSubject,
  formatDate,
  nextEvents,
  subjectName,
  subjects,
} = useFocoAula()
</script>

<template>
  <section class="screen">
    <form class="composer" @submit.prevent="createEvent">
      <h2>Calendário acadêmico</h2>
      <p v-if="eventRequiresSubject && !subjects.length" class="guidance-message">
        Cadastre uma disciplina antes de registrar aulas ou provas.
      </p>
      <p v-else-if="eventMessage" class="inline-message">{{ eventMessage }}</p>
      <input v-model="eventForm.title" placeholder="Prova, aula ou compromisso" required />
      <div class="form-grid">
        <select v-model="eventForm.type">
          <option value="prova">Prova</option>
          <option value="aula">Aula</option>
          <option value="reuniao">Reuniao</option>
          <option value="compromisso">Compromisso</option>
        </select>
        <select v-model="eventForm.subjectId" :required="eventRequiresSubject">
          <option value="" :disabled="eventRequiresSubject">
            {{ eventRequiresSubject ? 'Selecione uma disciplina' : 'Sem disciplina' }}
          </option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
        </select>
      </div>
      <input v-model="eventForm.startsAt" type="datetime-local" required />
      <input v-model="eventForm.location" placeholder="Local" />
      <label>
        Lembrar antes (minutos)
        <input v-model.number="eventForm.reminderMinutesBefore" type="number" min="0" max="10080" />
      </label>
      <textarea v-model="eventForm.notes" placeholder="Conteúdo, materiais ou observações"></textarea>
      <button
        class="primary-action"
        :disabled="eventRequiresSubject && (!subjects.length || !eventForm.subjectId)"
      >
        <CalendarDays :size="18" /> Salvar data
      </button>
    </form>

    <article v-for="event in nextEvents" :key="event.id" class="event-card">
      <div class="date-badge">
        <strong>{{ new Date(event.startsAt).getDate().toString().padStart(2, '0') }}</strong>
        <span>{{ new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(event.startsAt)) }}</span>
      </div>
      <div>
        <strong>{{ event.title }}</strong>
        <p>{{ subjectName(event.subjectId) }} · {{ event.location || event.type }}</p>
        <small>{{ formatDate(event.startsAt) }}</small>
      </div>
      <button class="mini-action danger" type="button" title="Excluir data" @click="deleteEvent(event.id)">
        <Trash2 :size="17" />
      </button>
    </article>
  </section>
</template>
