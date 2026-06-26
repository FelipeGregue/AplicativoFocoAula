import { computed, reactive, ref } from 'vue'
import { router } from '../router'
import { LocalRepository } from '../services/localRepository'
import { cancelReminder, scheduleReminder } from '../services/notificationService'
import type {
  AcademicEvent,
  AcademicTask,
  ApiStatus,
  AuthForm,
  AuthMode,
  Average,
  EventForm,
  Grade,
  GradeForm,
  PomodoroMode,
  ReminderSettings,
  Subject,
  SubjectForm,
  Tab,
  TaskForm,
  TaskStatus,
  User,
} from '../types'
import { datetimeLocal, dueLabel, formatDate } from '../utils/date'
import { readLocal, writeLocal } from '../utils/storage'

const localRepository = new LocalRepository()

const token = ref(localStorage.getItem('focoaula.token') ?? '')
const user = ref<User | null>(readLocal<User | null>('focoaula.user', null))
const loading = ref(false)
const apiStatus = ref<ApiStatus>('local')
const message = ref('')
const taskMessage = ref('')
const eventMessage = ref('')
const gradeMessage = ref('')
const authMode = ref<AuthMode>('register')

const subjects = ref<Subject[]>(readLocal('focoaula.subjects', []))
const tasks = ref<AcademicTask[]>(readLocal('focoaula.tasks', []))
const events = ref<AcademicEvent[]>(readLocal('focoaula.events', []))
const grades = ref<Grade[]>(readLocal('focoaula.grades', []))
const averages = ref<Average[]>(readLocal('focoaula.averages', []))
const reminders = ref<ReminderSettings>(
  readLocal('focoaula.reminders', {
    enabled: true,
    defaultMinutesBefore: 30,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  }),
)

const authForm = reactive<AuthForm>({
  name: 'Felipe',
  email: 'felipe@focoaula.app',
  password: '123456',
})

const taskForm = reactive<TaskForm>({
  title: '',
  description: '',
  subjectId: '',
  dueDate: datetimeLocal(1),
  priority: 'alta',
  status: 'pendente',
  recurrence: 'nenhuma',
  reminderMinutesBefore: 30,
})

const eventForm = reactive<EventForm>({
  title: '',
  type: 'prova',
  subjectId: '',
  startsAt: datetimeLocal(3),
  location: '',
  notes: '',
  reminderMinutesBefore: 1440,
})

const gradeForm = reactive<GradeForm>({
  subjectId: '',
  title: '',
  score: 8,
  weight: 1,
  date: new Date().toISOString().slice(0, 10),
})

const gradeEditForm = reactive<GradeForm>({
  subjectId: '',
  title: '',
  score: 0,
  weight: 1,
  date: new Date().toISOString().slice(0, 10),
})

const subjectForm = reactive<SubjectForm>({
  name: '',
  teacher: '',
  color: '#6FAFC7',
})

const focusMinutes = ref(25)
const breakMinutes = ref(5)
const remainingSeconds = ref(focusMinutes.value * 60)
const pomodoroRunning = ref(false)
const pomodoroMode = ref<PomodoroMode>('foco')
const expandedSubjects = ref<string[]>([])
const editingGradeId = ref('')
let pomodoroInterval: number | undefined
let audioContext: AudioContext | undefined

const pendingTasks = computed(() => tasks.value.filter((task) => task.status !== 'concluida'))
const eventRequiresSubject = computed(() => eventForm.type === 'prova' || eventForm.type === 'aula')
const urgentTasks = computed(() => tasks.value.filter((task) => task.priority === 'urgente'))
const nextTasks = computed(() =>
  [...pendingTasks.value].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4),
)
const nextEvents = computed(() =>
  [...events.value].sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 4),
)
const completedPercent = computed(() => {
  if (!tasks.value.length) return 0
  return Math.round((tasks.value.filter((task) => task.status === 'concluida').length / tasks.value.length) * 100)
})
const gradeGroups = computed(() =>
  averages.value.map((average) => ({
    ...average,
    grades: grades.value
      .filter((grade) => grade.subjectId === average.subjectId)
      .sort((a, b) => b.date.localeCompare(a.date)),
  })),
)
const pomodoroLabel = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60).toString().padStart(2, '0')
  const seconds = (remainingSeconds.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

async function initSession() {
  if (!user.value) return
  await localRepository.ensureSessionUser(user.value)
  await refreshAll()
}

async function submitAuth() {
  loading.value = true
  message.value = ''
  try {
    if (authMode.value === 'register') {
      await localRepository.register({
        name: authForm.name,
        email: authForm.email,
        password: authForm.password,
      })
      authMode.value = 'login'
      message.value = 'Conta criada com sucesso. Entre com seu e-mail e senha.'
      return
    }

    const response = await localRepository.login({ email: authForm.email, password: authForm.password })
    token.value = response.token
    user.value = response.user
    localStorage.setItem('focoaula.token', response.token)
    writeLocal('focoaula.user', response.user)
    await refreshAll()
    await router.push({ name: 'painel' })
  } catch (error) {
    message.value = readableError(error)
  } finally {
    loading.value = false
  }
}

async function refreshAll() {
  await Promise.all([loadSubjects(), loadTasks(), loadEvents(), loadGrades(), loadReminders()])
}

async function loadSubjects() {
  if (!user.value) return
  subjects.value = await localRepository.listSubjects(user.value.id)
  if (!taskForm.subjectId && subjects.value[0]) taskForm.subjectId = subjects.value[0].id
  if (!eventForm.subjectId && subjects.value[0]) eventForm.subjectId = subjects.value[0].id
  if (!gradeForm.subjectId && subjects.value[0]) gradeForm.subjectId = subjects.value[0].id
}

async function loadTasks() {
  if (!user.value) return
  tasks.value = await localRepository.listTasks(user.value.id)
}

async function loadEvents() {
  if (!user.value) return
  events.value = await localRepository.listEvents(user.value.id)
}

async function loadGrades() {
  if (!user.value) return
  const response = await localRepository.listGrades(user.value.id)
  grades.value = response.grades
  averages.value = response.averages
}

async function loadReminders() {
  if (!user.value) return
  reminders.value = await localRepository.getReminders(user.value.id)
  taskForm.reminderMinutesBefore = reminders.value.defaultMinutesBefore
  eventForm.reminderMinutesBefore = reminders.value.defaultMinutesBefore
}

async function createTask() {
  if (!user.value) return
  taskMessage.value = ''

  const subjectExists = subjects.value.some((subject) => subject.id === taskForm.subjectId)
  if (!subjectExists) {
    taskMessage.value = 'Cadastre e selecione uma disciplina antes de registrar atividades.'
    return
  }

  const payload = normalizePayload(taskForm)
  const created = await localRepository.createTask(user.value.id, payload as unknown as TaskForm)
  await scheduleReminder({
    id: created.id,
    title: created.title,
    date: created.dueDate,
    minutesBefore: created.reminderMinutesBefore,
    subjectName: subjectName(created.subjectId),
    type: 'task',
  })
  tasks.value = [...tasks.value, created]
  taskForm.title = ''
  taskForm.description = ''
  taskForm.dueDate = datetimeLocal(2)
  taskMessage.value = ''
}

async function cycleTask(task: AcademicTask) {
  if (!user.value) return
  const nextStatus: TaskStatus =
    task.status === 'pendente' ? 'fazendo' : task.status === 'fazendo' ? 'concluida' : 'pendente'
  const updated = await localRepository.updateTask(user.value.id, task.id, { status: nextStatus })
  tasks.value = tasks.value.map((item) => (item.id === task.id ? updated : item))
}

async function deleteTask(taskId: string) {
  if (!user.value) return
  await localRepository.deleteTask(user.value.id, taskId)
  await cancelReminder('task', taskId)
  tasks.value = tasks.value.filter((task) => task.id !== taskId)
}

async function createEvent() {
  if (!user.value) return
  eventMessage.value = ''

  const subjectExists = subjects.value.some((subject) => subject.id === eventForm.subjectId)
  if (eventRequiresSubject.value && !subjectExists) {
    eventMessage.value = 'Selecione uma disciplina para registrar aulas ou provas.'
    return
  }

  if (!subjectExists) eventForm.subjectId = ''

  const created = await localRepository.createEvent(
    user.value.id,
    normalizePayload(eventForm) as unknown as EventForm,
  )
  await scheduleReminder({
    id: created.id,
    title: created.title,
    date: created.startsAt,
    minutesBefore: created.reminderMinutesBefore,
    subjectName: subjectName(created.subjectId),
    type: 'event',
  })
  events.value = [...events.value, created]
  eventForm.title = ''
  eventForm.location = ''
  eventForm.notes = ''
  eventMessage.value = ''
}

async function deleteEvent(eventId: string) {
  if (!user.value) return
  await localRepository.deleteEvent(user.value.id, eventId)
  await cancelReminder('event', eventId)
  events.value = events.value.filter((event) => event.id !== eventId)
}

async function createGrade() {
  if (!user.value) return
  gradeMessage.value = ''

  const subjectExists = subjects.value.some((subject) => subject.id === gradeForm.subjectId)
  if (!subjectExists) {
    gradeMessage.value = 'Cadastre e selecione uma disciplina antes de registrar notas.'
    return
  }

  await localRepository.createGrade(user.value.id, {
    ...normalizePayload(gradeForm),
    date: new Date(gradeForm.date).toISOString(),
  } as GradeForm)
  gradeForm.title = ''
  gradeMessage.value = ''
  await loadGrades()
}

function toggleSubjectGrades(subjectId: string) {
  expandedSubjects.value = expandedSubjects.value.includes(subjectId)
    ? expandedSubjects.value.filter((id) => id !== subjectId)
    : [...expandedSubjects.value, subjectId]
}

function isSubjectExpanded(subjectId: string) {
  return expandedSubjects.value.includes(subjectId)
}

function startGradeEdit(grade: Grade) {
  editingGradeId.value = grade.id
  gradeEditForm.subjectId = grade.subjectId
  gradeEditForm.title = grade.title
  gradeEditForm.score = grade.score
  gradeEditForm.weight = grade.weight
  gradeEditForm.date = grade.date.slice(0, 10)
}

function cancelGradeEdit() {
  editingGradeId.value = ''
}

async function saveGradeEdit(gradeId: string) {
  if (!user.value) return
  await localRepository.updateGrade(user.value.id, gradeId, {
    subjectId: gradeEditForm.subjectId,
    title: gradeEditForm.title,
    score: gradeEditForm.score,
    weight: gradeEditForm.weight,
    date: new Date(gradeEditForm.date).toISOString(),
  })
  editingGradeId.value = ''
  await loadGrades()
}

async function deleteGrade(gradeId: string) {
  if (!user.value) return
  await localRepository.deleteGrade(user.value.id, gradeId)
  if (editingGradeId.value === gradeId) editingGradeId.value = ''
  await loadGrades()
}

async function createSubject() {
  if (!user.value) return
  message.value = ''
  const created = await localRepository.createSubject(user.value.id, subjectForm)
  subjects.value = [...subjects.value, created]
  subjectForm.name = ''
  subjectForm.teacher = ''
}

async function deleteSubject(subjectId: string) {
  if (!user.value) return
  message.value = ''
  try {
    await localRepository.deleteSubject(user.value.id, subjectId)
    subjects.value = subjects.value.filter((subject) => subject.id !== subjectId)
  } catch (error) {
    message.value = readableError(error)
  }
}

async function saveReminders() {
  if (!user.value) return
  reminders.value = await localRepository.updateReminders(user.value.id, reminders.value)
  taskForm.reminderMinutesBefore = reminders.value.defaultMinutesBefore
  eventForm.reminderMinutesBefore = reminders.value.defaultMinutesBefore
}

function logout() {
  token.value = ''
  user.value = null
  localStorage.removeItem('focoaula.token')
  localStorage.removeItem('focoaula.user')
  void router.push({ name: 'login' })
}

function startPomodoro() {
  if (pomodoroRunning.value) return
  prepareAudio()
  pomodoroRunning.value = true
  pomodoroInterval = window.setInterval(() => {
    remainingSeconds.value -= 1
    if (remainingSeconds.value <= 0) {
      pomodoroMode.value = pomodoroMode.value === 'foco' ? 'pausa' : 'foco'
      remainingSeconds.value = (pomodoroMode.value === 'foco' ? focusMinutes.value : breakMinutes.value) * 60
      void router.push({ name: 'pomodoro' })
      playPomodoroSound()
      notify('Ciclo concluido', pomodoroMode.value === 'foco' ? 'Hora de voltar ao foco.' : 'Pausa curta liberada.')
    }
  }, 1000)
}

function pausePomodoro() {
  pomodoroRunning.value = false
  if (pomodoroInterval) window.clearInterval(pomodoroInterval)
}

function resetPomodoro() {
  pausePomodoro()
  pomodoroMode.value = 'foco'
  remainingSeconds.value = focusMinutes.value * 60
}

function stopPomodoroTimer() {
  if (pomodoroInterval) window.clearInterval(pomodoroInterval)
}

function subjectName(subjectId?: string) {
  return subjects.value.find((subject) => subject.id === subjectId)?.name ?? 'Sem disciplina'
}

function subjectColor(subjectId?: string) {
  return subjects.value.find((subject) => subject.id === subjectId)?.color ?? '#6FAFC7'
}

async function notify(title: string, body: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') await Notification.requestPermission()
  if (Notification.permission === 'granted') new Notification(title, { body })
}

function prepareAudio() {
  const AudioContextClass = window.AudioContext
  audioContext ??= new AudioContextClass()
  if (audioContext.state === 'suspended') void audioContext.resume()
}

function playPomodoroSound() {
  if (!audioContext) prepareAudio()
  if (!audioContext) return

  const now = audioContext.currentTime
  ;[0, 0.18, 0.36].forEach((offset) => {
    const oscillator = audioContext!.createOscillator()
    const gain = audioContext!.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, now + offset)
    gain.gain.setValueAtTime(0.0001, now + offset)
    gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.12)

    oscillator.connect(gain)
    gain.connect(audioContext!.destination)
    oscillator.start(now + offset)
    oscillator.stop(now + offset + 0.13)
  })
}

function navigateTo(tab: Tab) {
  void router.push({ name: tab })
}

function normalizePayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (key.endsWith('At') || key.endsWith('Date')) {
        return [key, new Date(String(value)).toISOString()]
      }
      if (typeof value === 'string') return [key, value.trim()]
      return [key, value]
    }),
  )
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível concluir a ação.'
}

export function useFocoAula() {
  return {
    apiStatus,
    authForm,
    authMode,
    averages,
    breakMinutes,
    cancelGradeEdit,
    completedPercent,
    createEvent,
    createGrade,
    createSubject,
    createTask,
    cycleTask,
    deleteEvent,
    deleteGrade,
    deleteSubject,
    deleteTask,
    dueLabel,
    editingGradeId,
    eventForm,
    eventMessage,
    eventRequiresSubject,
    events,
    expandedSubjects,
    focusMinutes,
    formatDate,
    gradeEditForm,
    gradeForm,
    gradeGroups,
    gradeMessage,
    grades,
    initSession,
    isSubjectExpanded,
    loading,
    logout,
    message,
    navigateTo,
    nextEvents,
    nextTasks,
    pendingTasks,
    pausePomodoro,
    playPomodoroSound,
    pomodoroLabel,
    pomodoroMode,
    pomodoroRunning,
    reminders,
    resetPomodoro,
    saveGradeEdit,
    saveReminders,
    startGradeEdit,
    startPomodoro,
    stopPomodoroTimer,
    subjectColor,
    subjectForm,
    subjectName,
    subjects,
    submitAuth,
    taskForm,
    taskMessage,
    tasks,
    toggleSubjectGrades,
    urgentTasks,
    user,
  }
}
