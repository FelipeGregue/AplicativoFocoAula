<script setup lang="ts">
import { BookOpen, Trash2 } from '@lucide/vue'
import { useFocoAula } from '../composables/useFocoAula'

const { createSubject, deleteSubject, message, subjectForm, subjects } = useFocoAula()
</script>

<template>
  <section class="screen">
    <form class="composer" @submit.prevent="createSubject">
      <h2>Nova disciplina</h2>
      <input v-model="subjectForm.name" placeholder="Nome da disciplina" required />
      <input v-model="subjectForm.teacher" placeholder="Professor(a)" />
      <input v-model="subjectForm.color" type="color" />
      <button class="primary-action"><BookOpen :size="18" /> Criar disciplina</button>
    </form>

    <section class="list-section">
      <h2>Minhas disciplinas</h2>
      <p v-if="message" class="inline-message">{{ message }}</p>
      <article v-if="!subjects.length" class="empty-state">
        Nenhuma disciplina cadastrada.
      </article>
      <template v-else>
        <article v-for="subject in subjects" :key="subject.id" class="subject-card">
          <span :style="{ background: subject.color }"></span>
          <div>
            <strong>{{ subject.name }}</strong>
            <small>{{ subject.teacher || 'Professor não informado' }}</small>
          </div>
          <button
            class="mini-action danger"
            type="button"
            title="Excluir disciplina"
            @click="deleteSubject(subject.id)"
          >
            <Trash2 :size="17" />
          </button>
        </article>
      </template>
    </section>
  </section>
</template>
