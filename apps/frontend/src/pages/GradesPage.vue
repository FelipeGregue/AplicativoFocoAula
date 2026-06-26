<script setup lang="ts">
import { ChevronDown, GraduationCap, Pencil, Save, Trash2, X } from '@lucide/vue'
import { useFocoAula } from '../composables/useFocoAula'

const {
  cancelGradeEdit,
  createGrade,
  deleteGrade,
  editingGradeId,
  gradeEditForm,
  gradeForm,
  gradeGroups,
  gradeMessage,
  isSubjectExpanded,
  saveGradeEdit,
  startGradeEdit,
  subjects,
  toggleSubjectGrades,
} = useFocoAula()

const DIRECT_APPROVAL_AVERAGE = 7

function finalExamScore(average: number) {
  return (5 - average * 0.6) / 0.4
}

function finalExamStatus(average: number, assessments: number) {
  if (!assessments) {
    return {
      tone: 'empty',
      title: 'Sem notas suficientes',
      description: 'Cadastre uma avaliação para calcular a situação da disciplina.',
    }
  }

  if (average >= DIRECT_APPROVAL_AVERAGE) {
    return {
      tone: 'approved',
      title: 'Aprovado por média',
      description: 'Média igual ou superior a 7. Prova final dispensada.',
    }
  }

  const requiredScore = finalExamScore(average)

  if (requiredScore > 10) {
    return {
      tone: 'failed',
      title: 'Reprovado na disciplina',
      description: 'A nota necessária na final seria maior que 10.',
    }
  }

  return {
    tone: 'final',
    title: `Final: precisa de ${requiredScore.toFixed(1)}`,
    description: 'Nota mínima necessária na avaliação final para aprovação.',
  }
}
</script>

<template>
  <section class="screen">
    <form class="composer" @submit.prevent="createGrade">
      <h2>Notas e médias</h2>
      <p v-if="!subjects.length" class="guidance-message">
        Cadastre uma disciplina antes de registrar notas.
      </p>
      <p v-else-if="gradeMessage" class="inline-message">{{ gradeMessage }}</p>
      <select v-model="gradeForm.subjectId" :disabled="!subjects.length" required>
        <option disabled value="">Selecione uma disciplina</option>
        <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
      </select>
      <input v-model="gradeForm.title" placeholder="Avaliação" required />
      <div class="form-grid">
        <label>
          Nota
          <input v-model.number="gradeForm.score" max="10" min="0" placeholder="Ex.: 8.5" step="0.1" type="number" />
        </label>
        <label>
          Peso
          <input v-model.number="gradeForm.weight" max="10" min="0.1" placeholder="Ex.: 2" step="0.1" type="number" />
        </label>
      </div>
      <input v-model="gradeForm.date" type="date" />
      <button class="primary-action" :disabled="!subjects.length || !gradeForm.subjectId">
        <GraduationCap :size="18" /> Registrar nota
      </button>
    </form>

    <article v-for="group in gradeGroups" :key="group.subjectId" class="grade-collapse">
      <button class="grade-summary" type="button" @click="toggleSubjectGrades(group.subjectId)">
        <span class="subject-dot" :style="{ backgroundColor: group.color }"></span>
        <span>
          <strong>{{ group.subjectName }}</strong>
          <small>{{ group.assessments }} avaliação(ões)</small>
        </span>
        <b>{{ group.average.toFixed(1) }}</b>
        <ChevronDown :class="{ open: isSubjectExpanded(group.subjectId) }" :size="20" />
      </button>

      <div v-if="isSubjectExpanded(group.subjectId)" class="grade-detail-list">
        <article class="final-exam-card" :class="finalExamStatus(group.average, group.assessments).tone">
          <div>
            <strong>{{ finalExamStatus(group.average, group.assessments).title }}</strong>
            <small>{{ finalExamStatus(group.average, group.assessments).description }}</small>
          </div>
          <b>{{ group.average.toFixed(1) }}</b>
        </article>

        <p v-if="!group.grades.length" class="empty-state">Nenhuma nota cadastrada para esta disciplina.</p>

        <div v-for="grade in group.grades" :key="grade.id" class="grade-detail">
          <form v-if="editingGradeId === grade.id" class="grade-edit-form" @submit.prevent="saveGradeEdit(grade.id)">
            <select v-model="gradeEditForm.subjectId" required>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
            </select>
            <input v-model="gradeEditForm.title" placeholder="Avaliação" required />
            <div class="form-grid">
              <label>
                Nota
                <input
                  v-model.number="gradeEditForm.score"
                  max="10"
                  min="0"
                  placeholder="Ex.: 8.5"
                  step="0.1"
                  type="number"
                />
              </label>
              <label>
                Peso
                <input
                  v-model.number="gradeEditForm.weight"
                  max="10"
                  min="0.1"
                  placeholder="Ex.: 2"
                  step="0.1"
                  type="number"
                />
              </label>
            </div>
            <input v-model="gradeEditForm.date" type="date" />
            <div class="grade-actions">
              <button class="mini-action save" type="submit" title="Salvar nota">
                <Save :size="17" />
              </button>
              <button class="mini-action" type="button" title="Cancelar edicao" @click="cancelGradeEdit">
                <X :size="17" />
              </button>
            </div>
          </form>

          <template v-else>
            <div>
              <strong>{{ grade.title }}</strong>
              <small>{{ new Date(grade.date).toLocaleDateString('pt-BR') }} · peso {{ grade.weight }}</small>
            </div>
            <b>{{ grade.score.toFixed(1) }}</b>
            <div class="grade-actions">
              <button class="mini-action" type="button" title="Editar nota" @click="startGradeEdit(grade)">
                <Pencil :size="17" />
              </button>
              <button class="mini-action danger" type="button" title="Excluir nota" @click="deleteGrade(grade.id)">
                <Trash2 :size="17" />
              </button>
            </div>
          </template>
        </div>
      </div>
    </article>
  </section>
</template>
