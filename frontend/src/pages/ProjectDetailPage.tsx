import { type ChangeEvent, type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TaskKanban } from '../components/TaskKanban'
import {
  apiContracts,
  apiCreateTask,
  apiCreateTest,
  apiDocuments,
  apiOrigin,
  apiPhases,
  apiProject,
  apiTasks,
  apiTests,
  apiUpdateProject,
  apiUpdateTask,
  apiUsers,
} from '../api'
import { docStatusLabel, projectStatusLabel, taskStatusLabel } from '../labels'
import { useI18n } from '../i18n'
import type {
  Contract,
  Document,
  Phase,
  Project,
  ProjectStatus,
  Task,
  TaskStatus,
  TestRecord,
  User,
} from '../types'

export function ProjectDetailPage() {
  const { lang } = useI18n()
  const { id } = useParams()
  const projectId = Number(id)
  const [project, setProject] = useState<Project | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [tests, setTests] = useState<TestRecord[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [taskView, setTaskView] = useState<'table' | 'board'>('table')
  const [codeCopied, setCodeCopied] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isFinite(projectId)) return
    setErr(null)
    try {
      const [p, u, t, ph, c, d, te] = await Promise.all([
        apiProject(projectId),
        apiUsers(),
        apiTasks(projectId),
        apiPhases(projectId),
        apiContracts(projectId),
        apiDocuments(projectId),
        apiTests(projectId),
      ])
      setProject(p)
      setUsers(u)
      setTasks(t)
      setPhases(ph)
      setContracts(c)
      setDocuments(d)
      setTests(te)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка загрузки')
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!Number.isFinite(projectId)) return
    try {
      const v = sessionStorage.getItem(`kompleks-taskview-${projectId}`)
      if (v === 'board' || v === 'table') setTaskView(v)
    } catch {
      /* ignore */
    }
  }, [projectId])

  useEffect(() => {
    if (!Number.isFinite(projectId)) return
    try {
      sessionStorage.setItem(`kompleks-taskview-${projectId}`, taskView)
    } catch {
      /* ignore */
    }
  }, [projectId, taskView])

  async function onStatusChange(e: ChangeEvent<HTMLSelectElement>) {
    if (!project) return
    const status = e.target.value as ProjectStatus
    try {
      const p = await apiUpdateProject(project.id, { status })
      setProject(p)
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Ошибка')
    }
  }

  async function onManagerChange(e: ChangeEvent<HTMLSelectElement>) {
    if (!project) return
    const v = e.target.value
    const manager_id = v === '' ? null : Number(v)
    try {
      const p = await apiUpdateProject(project.id, { manager_id })
      setProject(p)
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Ошибка')
    }
  }

  async function onTaskStatus(t: Task, status: TaskStatus) {
    try {
      await apiUpdateTask(projectId, t.id, { status })
      await load()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Ошибка')
    }
  }

  async function copyProjectCode() {
    if (!project) return
    try {
      await navigator.clipboard.writeText(project.code)
      setCodeCopied(true)
      window.setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      setErr('Не удалось скопировать код')
    }
  }

  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const title = String(fd.get('title') || '').trim()
    if (!title) return
    try {
      await apiCreateTask(projectId, {
        title,
        status: 'todo',
        assignee_id: fd.get('assignee') ? Number(fd.get('assignee')) : null,
        phase_id: fd.get('phase') ? Number(fd.get('phase')) : null,
        due_date: String(fd.get('due') || '') || null,
      })
      form.reset()
      await load()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Ошибка')
    }
  }

  async function addTest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get('name') || '').trim()
    if (!name) return
    try {
      await apiCreateTest(projectId, {
        name,
        test_type: String(fd.get('test_type') || '') || null,
        location: String(fd.get('location') || '') || null,
        performed_at: String(fd.get('performed_at') || '') || null,
        result_summary: String(fd.get('result_summary') || '') || null,
        protocol_ref: String(fd.get('protocol_ref') || '') || null,
      })
      form.reset()
      await load()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Ошибка')
    }
  }

  async function uploadDoc(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const file = fd.get('file')
    if (!(file instanceof File) || !file.size) return
    const token = localStorage.getItem('token')
    const body = new FormData()
    body.append('file', file)
    body.append('title', String(fd.get('title') || file.name))
    body.append('doc_type', String(fd.get('doc_type') || ''))
    try {
      const res = await fetch(`${apiOrigin}/api/projects/${projectId}/documents/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body,
      })
      if (!res.ok) throw new Error(await res.text())
      form.reset()
      await load()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Ошибка загрузки')
    }
  }

  if (!Number.isFinite(projectId)) {
    return <p className="text-red-600">Некорректный идентификатор</p>
  }

  if (err && !project) {
    return (
      <div>
        <Link to="/projects" className="text-sm text-brand-600 hover:underline">
          ← К проектам
        </Link>
        <p className="mt-4 text-red-600">{err}</p>
      </div>
    )
  }

  if (!project) {
    return <div className="text-slate-500 text-sm">Загрузка…</div>
  }

  return (
    <div>
      <Link
        to="/projects"
        className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
      >
        ← Все проекты
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-brand-700 dark:text-brand-400">{project.code}</span>
            <button
              type="button"
              onClick={copyProjectCode}
              className="rounded-md border border-slate-200 dark:border-slate-600 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {codeCopied ? 'Скопировано' : 'Копировать код'}
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{project.name}</h1>
          {project.customer_name && (
            <p className="text-slate-600 dark:text-slate-400 mt-1">Заказчик: {project.customer_name}</p>
          )}
          {project.object_address && (
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">{project.object_address}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Статус</label>
            <select
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              value={project.status}
              onChange={onStatusChange}
            >
              {(['draft', 'active', 'on_hold', 'completed'] as ProjectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {projectStatusLabel(lang, s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Руководитель</label>
            <select
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm min-w-[180px] text-slate-900 dark:text-slate-100"
              value={project.manager_id ?? ''}
              onChange={onManagerChange}
            >
              <option value="">Не назначен</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {err && (
        <p className="mt-4 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          {err}
        </p>
      )}

      {project.description && (
        <p className="mt-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed max-w-3xl">{project.description}</p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Договоры</h2>
        <div className="mt-3 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Номер</th>
                <th className="px-4 py-2 text-left">Дата</th>
                <th className="px-4 py-2 text-left">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 font-medium">{c.number}</td>
                  <td className="px-4 py-2 text-slate-600">{c.signed_date ?? '—'}</td>
                  <td className="px-4 py-2">
                    {c.amount != null ? `${Number(c.amount).toLocaleString('ru-RU')} ₸` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contracts.length === 0 && <div className="px-4 py-6 text-center text-slate-500 text-sm">Нет записей</div>}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Этапы</h2>
        <ol className="mt-3 space-y-2">
          {phases.map((ph) => (
            <li key={ph.id} className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200/80 flex flex-wrap justify-between gap-2">
              <span className="font-medium">{ph.name}</span>
              <span className="text-xs text-slate-500">
                {ph.start_date ?? '…'} — {ph.end_date ?? '…'}
              </span>
            </li>
          ))}
        </ol>
        {phases.length === 0 && <p className="text-sm text-slate-500 mt-2">Этапы не заведены</p>}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Задачи</h2>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 p-0.5 bg-slate-50 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setTaskView('table')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                taskView === 'table'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Таблица
            </button>
            <button
              type="button"
              onClick={() => setTaskView('board')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                taskView === 'board'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Канбан
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          В режиме канбана перетаскивайте карточки между колонками, чтобы менять статус.
        </p>

        {taskView === 'board' ? (
          <div className="mt-4">
            <TaskKanban tasks={tasks} onMove={(t, s) => void onTaskStatus(t, s)} />
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl bg-white dark:bg-slate-900/90 shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left">Задача</th>
                  <th className="px-4 py-2 text-left">Срок</th>
                  <th className="px-4 py-2 text-left">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{t.title}</div>
                      {t.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t.due_date ?? '—'}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        className="rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100"
                        value={t.status}
                        onChange={(e) => onTaskStatus(t, e.target.value as TaskStatus)}
                      >
                        {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {taskStatusLabel(lang, s)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 ring-1 ring-slate-200/60 dark:ring-slate-700" onSubmit={addTask}>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">Новая задача</label>
            <input name="title" required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Название" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Этап</label>
            <select name="phase" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">—</option>
              {phases.map((ph) => (
                <option key={ph.id} value={ph.id}>
                  {ph.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600">Исполнитель</label>
            <select name="assignee" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">—</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600">Срок</label>
            <input name="due" type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <button type="submit" className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Добавить
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Документы</h2>
        <div className="mt-3 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Документ</th>
                <th className="px-4 py-2 text-left">Тип</th>
                <th className="px-4 py-2 text-left">Версия</th>
                <th className="px-4 py-2 text-left">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2">
                    {d.file_path ? (
                      <a
                        href={`${apiOrigin}/files/${d.file_path}`}
                        className="text-brand-700 hover:underline font-medium"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {d.title}
                      </a>
                    ) : (
                      <span className="font-medium">{d.title}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{d.doc_type ?? '—'}</td>
                  <td className="px-4 py-2">{d.version}</td>
                  <td className="px-4 py-2">{docStatusLabel(lang, d.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="mt-4 flex flex-wrap gap-3 items-end rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/60" onSubmit={uploadDoc}>
          <div>
            <label className="text-xs text-slate-600">Файл</label>
            <input name="file" type="file" required className="mt-1 block text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Название</label>
            <input name="title" className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="По умолчанию — имя файла" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Тип</label>
            <input name="doc_type" className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Отчёт, акт…" />
          </div>
          <button type="submit" className="rounded-lg bg-slate-800 text-white px-4 py-2 text-sm font-medium hover:bg-slate-900">
            Загрузить
          </button>
        </form>
      </section>

      <section className="mt-10 mb-16">
        <h2 className="text-lg font-semibold text-slate-900">Испытания и анализ</h2>
        <div className="mt-3 space-y-3">
          {tests.map((t) => (
            <div key={t.id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200/80">
              <div className="font-medium text-slate-900">{t.name}</div>
              <div className="mt-1 text-sm text-slate-600">
                {t.test_type && <span>{t.test_type}</span>}
                {t.location && <span className="ml-2">· {t.location}</span>}
                {t.performed_at && <span className="ml-2">· {t.performed_at}</span>}
              </div>
              {t.result_summary && <p className="mt-2 text-sm text-slate-700">{t.result_summary}</p>}
              {t.protocol_ref && <div className="mt-1 text-xs text-slate-500">Протокол: {t.protocol_ref}</div>}
            </div>
          ))}
        </div>
        {tests.length === 0 && <p className="text-sm text-slate-500">Нет записей об испытаниях</p>}

        <form className="mt-6 grid gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/60" onSubmit={addTest}>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">Наименование испытания *</label>
            <input name="name" required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Тип</label>
            <input name="test_type" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Место / участок</label>
            <input name="location" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Дата</label>
            <input name="performed_at" type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Протокол (ссылка/номер)</label>
            <input name="protocol_ref" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-600">Краткое заключение</label>
            <textarea name="result_summary" rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Добавить запись
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
