<script setup lang="ts">
import { CheckCircle2, Plus, Trash2 } from '@lucide/vue'
import { useFocoAula } from '../composables/useFocoAula'

const { createTask, cycleTask, deleteTask, formatDate, subjectName, subjects, taskForm, taskMessage, tasks } =
  useFocoAula()

function taskStatusAction(status: string) {
  if (status === 'pendente') {
    return 'Iniciar'
  }

  if (status === 'fazendo') {
    return 'Concluir'
  }

  return 'Reabrir'
}
</script>

<template>
  <section class="screen">
    <form class="composer" @submit.prevent="createTask">
      <h2>Nova atividade</h2>
      <p v-if="!subjects.length" class="guidance-message">
        Cadastre uma disciplina antes de registrar atividades.
      </p>
      <p v-else-if="taskMessage" class="inline-message">{{ taskMessage }}</p>
      <input v-model="taskForm.title" placeholder="Título da tarefa" required />
      <textarea v-model="taskForm.description" placeholder="Descrição curta"></textarea>
      <div class="form-grid">
        <select v-model="taskForm.subjectId" :disabled="!subjects.length" required>
          <option disabled value="">Selecione uma disciplina</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
        </select>
        <select v-model="taskForm.priority">
          <option value="baixa">Baixa</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>
      <div class="form-grid">
        <input v-model="taskForm.dueDate" type="datetime-local" required />
        <select v-model="taskForm.recurrence">
          <option value="nenhuma">Sem repetição</option>
          <option value="diaria">Diária</option>
          <option value="semanal">Semanal</option>
          <option value="mensal">Mensal</option>
        </select>
      </div>
      <label>
        Lembrar antes (minutos)
        <input v-model.number="taskForm.reminderMinutesBefore" type="number" min="0" max="10080" />
      </label>
      <button class="primary-action" :disabled="!subjects.length || !taskForm.subjectId">
        <Plus :size="18" /> Adicionar
      </button>
    </form>

    <article v-for="task in tasks" :key="task.id" class="task-card">
      <span class="status-button" :class="task.status">
        <CheckCircle2 :size="22" />
      </span>
      <div>
        <strong>{{ task.title }}</strong>
        <p>{{ task.description || subjectName(task.subjectId) }}</p>
        <small>{{ formatDate(task.dueDate) }} · {{ task.recurrence }}</small>
        <span class="priority-chip" :class="task.priority">{{ task.priority }}</span>
      </div>
      <div class="task-actions">
        <button class="status-action" :class="task.status" type="button" @click="cycleTask(task)">
          {{ taskStatusAction(task.status) }}
        </button>
        <button class="mini-action danger" type="button" title="Excluir atividade" @click="deleteTask(task.id)">
          <Trash2 :size="17" />
        </button>
      </div>
    </article>
  </section>
</template>
