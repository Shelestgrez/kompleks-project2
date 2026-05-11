import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiDashboard, apiDashboardInsights, apiRecentTasks } from '../api'
import { projectStatusLabel, taskStatusLabel } from '../labels'
import { useI18n } from '../i18n'
import type { DashboardInsights, DashboardStats, RecentTask } from '../types'

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint?: string
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 p-5 shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  )
}

function StatusBars({
  title,
  data,
  labels,
}: {
  title: string
  data: Record<string, number>
  labels: Record<string, string>
}) {
  const entries = Object.entries(data)
  const max = Math.max(1, ...entries.map(([, v]) => v))
  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 p-5 shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {entries.map(([key, n]) => (
          <div key={key}>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span>{labels[key] ?? key}</span>
              <span className="tabular-nums font-medium">{n}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-sky-500 transition-all duration-500"
                style={{ width: `${(n / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [insights, setInsights] = useState<DashboardInsights | null>(null)
  const [recent, setRecent] = useState<RecentTask[]>([])
  const [err, setErr] = useState<string | null>(null)
  const { t, lang } = useI18n()

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [a, b, c] = await Promise.allSettled([
        apiDashboard(),
        apiDashboardInsights(),
        apiRecentTasks(14),
      ])
      if (!alive) return

      if (a.status === 'fulfilled') {
        setStats(a.value)
        setErr(null)
      } else {
        setStats(null)
        setErr(a.reason instanceof Error ? a.reason.message : t('common.error.load'))
      }

      if (b.status === 'fulfilled') setInsights(b.value)
      else setInsights(null)

      if (c.status === 'fulfilled') setRecent(c.value)
      else setRecent([])
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('dashboard.title')}</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">{t('dashboard.subtitle')}</p>

      {err && <p className="mt-4 text-red-600 dark:text-red-400 text-sm">{err}</p>}

      {stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={t('dashboard.stats.projectsTotal')} value={stats.projects_total} />
          <Stat label={t('dashboard.stats.projectsActive')} value={stats.projects_active} />
          <Stat label={t('dashboard.stats.tasksOpen')} value={stats.tasks_open} />
          <Stat
            label={t('dashboard.stats.tasksOverdue')}
            value={stats.tasks_overdue}
            hint={t('dashboard.stats.tasksOverdueHint')}
          />
        </div>
      )}

      {insights && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <StatusBars
            title={t('dashboard.blocks.tasksByStatus')}
            data={insights.tasks_by_status}
            labels={
              Object.fromEntries(
                Object.keys(insights.tasks_by_status).map((k) => [k, taskStatusLabel(lang, k as any)]),
              ) as Record<string, string>
            }
          />
          <StatusBars
            title={t('dashboard.blocks.projectsByStatus')}
            data={insights.projects_by_status}
            labels={
              Object.fromEntries(
                Object.keys(insights.projects_by_status).map((k) => [k, projectStatusLabel(lang, k as any)]),
              ) as Record<string, string>
            }
          />
        </div>
      )}

      {insights && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gradient-to-br from-brand-600/10 to-sky-500/10 dark:from-brand-500/20 dark:to-sky-600/10 px-5 py-4 ring-1 ring-brand-200/50 dark:ring-brand-800/50">
            <div className="text-xs font-medium uppercase tracking-wide text-brand-800 dark:text-brand-300">
              {t('dashboard.blocks.documentsTotal')}
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {insights.documents_total}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-600/10 to-teal-500/10 dark:from-emerald-500/15 px-5 py-4 ring-1 ring-emerald-200/50 dark:ring-emerald-800/50">
            <div className="text-xs font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              {t('dashboard.blocks.testsTotal')}
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {insights.tests_total}
            </div>
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('dashboard.recent.title')}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('dashboard.recent.subtitle')}</p>
          <ul className="mt-4 divide-y divide-slate-200/80 dark:divide-slate-700 rounded-xl overflow-hidden ring-1 ring-slate-200/80 dark:ring-slate-700 bg-white dark:bg-slate-900/90">
            {recent.map((item) => (
              <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <div className="min-w-0">
                  <Link
                    to={`/projects/${item.project_id}`}
                    className="font-medium text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    {item.title}
                  </Link>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-mono text-brand-700 dark:text-brand-400">{item.project_code}</span>
                    <span className="mx-1">·</span>
                    {item.project_name}
                    {item.assignee_name && (
                      <>
                        <span className="mx-1">·</span>
                        {item.assignee_name}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                    {taskStatusLabel(lang, item.status)}
                  </span>
                  {item.due_date && (
                    <span className="text-xs text-amber-700 dark:text-amber-400">
                      {t('dashboard.recent.duePrefix')} {item.due_date}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10">
        <Link
          to="/projects"
          className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 shadow-sm"
        >
          {t('dashboard.toProjects')}
        </Link>
      </div>
    </div>
  )
}
