import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

type ReminderTarget = 'task' | 'event'

interface ReminderInput {
  id: string
  title: string
  date: string
  minutesBefore: number
  subjectName?: string
  type: ReminderTarget
}

const NOTIFICATION_ID_BASE = {
  task: 100000,
  event: 200000,
}

export async function scheduleReminder(input: ReminderInput) {
  if (!Capacitor.isNativePlatform()) return
  if (input.minutesBefore < 0) return

  const at = new Date(input.date)
  at.setMinutes(at.getMinutes() - input.minutesBefore)

  if (Number.isNaN(at.getTime()) || at.getTime() <= Date.now()) return

  const permission = await ensureNotificationPermission()
  if (!permission) return

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notificationId(input.type, input.id),
        title: input.type === 'task' ? 'Atividade acadêmica' : 'Calendário acadêmico',
        body: reminderBody(input),
        schedule: {
          at,
          allowWhileIdle: true,
        },
        extra: {
          sourceId: input.id,
          sourceType: input.type,
        },
      },
    ],
  })
}

export async function cancelReminder(type: ReminderTarget, id: string) {
  if (!Capacitor.isNativePlatform()) return

  await LocalNotifications.cancel({
    notifications: [{ id: notificationId(type, id) }],
  })
}

async function ensureNotificationPermission() {
  const current = await LocalNotifications.checkPermissions()
  if (current.display === 'granted') return true

  const requested = await LocalNotifications.requestPermissions()
  return requested.display === 'granted'
}

function reminderBody(input: ReminderInput) {
  const prefix = input.minutesBefore === 0 ? 'Agora' : `Em ${input.minutesBefore} min`
  const subject = input.subjectName ? ` (${input.subjectName})` : ''
  return `${prefix}: ${input.title}${subject}`
}

function notificationId(type: ReminderTarget, id: string) {
  const hash = [...id].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0)
  return NOTIFICATION_ID_BASE[type] + (hash % 90000)
}
