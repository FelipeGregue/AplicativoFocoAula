export function datetimeLocal(days = 0) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setMinutes(0, 0, 0)
  return localDateTimeValue(date)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function dueLabel(value: string) {
  const target = startOfLocalDay(new Date(value))
  const today = startOfLocalDay(new Date())
  const days = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (days < 0) return `${Math.abs(days)} dia(s) atrasada`
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Amanha'
  return `Em ${days} dias`
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function localDateTimeValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
