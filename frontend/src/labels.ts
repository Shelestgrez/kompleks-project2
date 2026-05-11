import type { ProjectStatus, TaskStatus } from './types'
import type { Lang } from './i18n'

export function projectStatusLabel(lang: Lang, status: ProjectStatus): string {
  const key = `status.project.${status}` as const
  const map: Record<typeof key, { ru: string; kk: string; en: string }> = {
    'status.project.draft': { ru: 'Черновик', kk: 'Жоба', en: 'Draft' },
    'status.project.active': { ru: 'Активен', kk: 'Белсенді', en: 'Active' },
    'status.project.on_hold': { ru: 'Приостановлен', kk: 'Тоқтатылған', en: 'On hold' },
    'status.project.completed': { ru: 'Завершён', kk: 'Аяқталған', en: 'Completed' },
  } as const
  const e = map[key as keyof typeof map]
  return e?.[lang] ?? status
}

export function taskStatusLabel(lang: Lang, status: TaskStatus): string {
  const key = `status.task.${status}` as const
  const map: Record<typeof key, { ru: string; kk: string; en: string }> = {
    'status.task.todo': { ru: 'К выполнению', kk: 'Орындауға', en: 'To do' },
    'status.task.in_progress': { ru: 'В работе', kk: 'Орындауда', en: 'In progress' },
    'status.task.review': { ru: 'На проверке', kk: 'Тексеруде', en: 'In review' },
    'status.task.done': { ru: 'Готово', kk: 'Дайын', en: 'Done' },
  } as const
  const e = map[key as keyof typeof map]
  return e?.[lang] ?? status
}

export function docStatusLabel(lang: Lang, status: 'draft' | 'review' | 'approved'): string {
  const key = `status.doc.${status}` as const
  const map: Record<typeof key, { ru: string; kk: string; en: string }> = {
    'status.doc.draft': { ru: 'Черновик', kk: 'Жоба', en: 'Draft' },
    'status.doc.review': { ru: 'На согласовании', kk: 'Келісуде', en: 'In approval' },
    'status.doc.approved': { ru: 'Утверждён', kk: 'Бекітілген', en: 'Approved' },
  } as const
  const e = map[key as keyof typeof map]
  return e?.[lang] ?? status
}
