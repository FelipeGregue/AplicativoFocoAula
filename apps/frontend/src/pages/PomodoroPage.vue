<script setup lang="ts">
import { TimerReset } from '@lucide/vue'
import { useFocoAula } from '../composables/useFocoAula'

const {
  breakMinutes,
  focusMinutes,
  pausePomodoro: pause,
  pomodoroLabel,
  pomodoroMode,
  resetPomodoro: reset,
  startPomodoro: start,
} = useFocoAula()
</script>

<template>
  <section class="screen pomodoro-screen">
    <div class="timer-face">
      <span>{{ pomodoroMode === 'foco' ? 'Foco ativo' : 'Pausa curta' }}</span>
      <strong>{{ pomodoroLabel }}</strong>
    </div>
    <div class="timer-controls">
      <button class="primary-action" @click="start">Iniciar</button>
      <button class="ghost-action" @click="pause">Pausar</button>
      <button class="icon-button" title="Reiniciar" @click="reset">
        <TimerReset :size="20" />
      </button>
    </div>
    <div class="slider-row">
      <label>
        Foco {{ focusMinutes }} min
        <input
          :value="focusMinutes"
          min="5"
          max="60"
          type="range"
          @input="focusMinutes = Number(($event.target as HTMLInputElement).value)"
          @change="reset"
        />
      </label>
      <label>
        Pausa {{ breakMinutes }} min
        <input
          :value="breakMinutes"
          min="3"
          max="20"
          type="range"
          @input="breakMinutes = Number(($event.target as HTMLInputElement).value)"
          @change="reset"
        />
      </label>
    </div>
  </section>
</template>
