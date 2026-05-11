import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiCreateProject, apiProjects } from '../api'
import { projectStatusLabel } from '../labels'
import { useI18n } from '../i18n'
import type { Project, ProjectStatus } from '../types'

const STAR_KEY = 'kompleks-starred-projects'

const STATUS_FILTER: Array<ProjectStatus | 'all'> = ['all', 'draft', 'active', 'on_hold', 'completed']

export function ProjectsPage() {
  const [list, setList] = useState<Project[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [starred, setStarred] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STAR_KEY) || '[]') as number[]
    } catch {
      return []
    }
  })
  const searchRef = useRef<HTMLInputElement>(null)
  const { lang } = useI18n()

  const starredSet = useMemo(() => new Set(starred), [starred])

  async function load() {
    setErr(null)
    try {
      setList(await apiProjects())
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '/') return
      const t = document.activeElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function toggleStar(id: number) {
    setStarred((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      const next = [...s]
      try {
        localStorage.setItem(STAR_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = list.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.customer_name?.toLowerCase().includes(q) ?? false)
      )
    })
    rows = [...rows].sort((a, b) => {
      const sa = starredSet.has(a.id) ? 1 : 0
      const sb = starredSet.has(b.id) ? 1 : 0
      if (sa !== sb) return sb - sa
      return a.name.localeCompare(b.name, 'ru')
    })
    return rows
  }, [list, query, statusFilter, starredSet])

  function exportCsv() {
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`
    const header = ['Код', 'Название', 'Заказчик', 'Статус']
    const lines = [
      header.join(';'),
      ...filtered.map((p) =>
        [p.code, p.name, p.customer_name ?? '', projectStatusLabel(lang, p.status)]
          .map((x) => esc(String(x)))
          .join(';'),
      ),
    ]
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get('name') || '').trim()
    const code = String(fd.get('code') || '').trim()
    if (!name || !code) return
    setBusy(true)
    try {
      await apiCreateProject({
        name,
        code,
        status: 'draft' as ProjectStatus,
        customer_name: String(fd.get('customer') || '') || null,
        object_address: String(fd.get('address') || '') || null,
      })
      form.reset()
      setOpen(false)
      await load()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Не удалось создать')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Проекты</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Строительные и инженерные проекты</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Экспорт CSV
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Новый проект
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="sr-only">Поиск</label>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по коду, названию, заказчику… ( / для фокуса )"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s === 'all' ? 'Все' : projectStatusLabel(lang, s)}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{err}</p>}

      <div className="mt-6 overflow-hidden rounded-xl bg-white dark:bg-slate-900/90 shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="w-10 px-2 py-3" aria-label="Избранное" />
              <th className="px-4 py-3">Код</th>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Заказчик</th>
              <th className="px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                <td className="px-2 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => toggleStar(p.id)}
                    className="text-lg leading-none hover:scale-110 transition-transform"
                    title={starredSet.has(p.id) ? 'Убрать из избранного' : 'В избранное'}
                  >
                    {starredSet.has(p.id) ? '★' : '☆'}
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-brand-700 dark:text-brand-400">
                  <Link to={`/projects/${p.id}`} className="hover:underline">
                    {p.code}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/projects/${p.id}`}
                    className="font-medium text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.customer_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {projectStatusLabel(lang, p.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !err && (
          <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            {list.length === 0 ? 'Нет проектов — создайте первый.' : 'Ничего не найдено — измените фильтры.'}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Новый проект</h2>
            <form className="mt-4 space-y-3" onSubmit={onCreate}>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Код проекта *</label>
                <input
                  name="code"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  placeholder="PRJ-2026-010"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Название *</label>
                <input
                  name="name"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Заказчик</label>
                <input
                  name="customer"
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Адрес объекта</label>
                <input
                  name="address"
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {busy ? 'Сохранение…' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
