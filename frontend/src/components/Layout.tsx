import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'
import { useTheme } from '../theme'
import { useI18n } from '../i18n'

const link =
  'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-brand-700 dark:hover:text-brand-400 transition-colors'
const active =
  'bg-white dark:bg-slate-800 shadow-sm text-brand-700 dark:text-brand-300 ring-1 ring-slate-200/80 dark:ring-slate-600'

export function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { lang, setLang, t } = useI18n()

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-slate-200/80 dark:border-slate-700 bg-white/70 dark:bg-slate-950/80 backdrop-blur-sm p-4 flex flex-col gap-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            ТОО
          </div>
          <div className="font-semibold text-slate-900 dark:text-white leading-tight">{t('app.name')}</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('app.tagline')}</p>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={({ isActive }) => (isActive ? `${link} ${active}` : link)}>
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? `${link} ${active}` : link)}>
            {t('nav.projects')}
          </NavLink>
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-slate-700 space-y-3">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setLang('kk')}
              className={`flex-1 rounded-md border px-2 py-1 text-[11px] ${
                lang === 'kk'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              KK
            </button>
            <button
              type="button"
              onClick={() => setLang('ru')}
              className={`flex-1 rounded-md border px-2 py-1 text-[11px] ${
                lang === 'ru'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`flex-1 rounded-md border px-2 py-1 text-[11px] ${
                lang === 'en'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title={t('layout.themeToggle')}
          >
            {theme === 'dark' ? t('layout.themeLight') : t('layout.themeDark')}
          </button>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate" title={user?.email}>
            {user?.full_name}
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-medium"
          >
            {t('layout.logout')}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 max-w-6xl w-full">
        <Outlet />
      </main>
    </div>
  )
}
