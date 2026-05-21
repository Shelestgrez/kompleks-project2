import { type FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiLogin, apiSignup } from '../api'
import { useAuth } from '../auth'
import { useTheme } from '../theme'
import { useI18n } from '../i18n'

export function RegisterPage() {
  const { token, login } = useAuth()
  const { theme, toggle } = useTheme()
  const { t } = useI18n()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (token) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    if (password !== password2) {
      setErr(t('auth.registerPasswordMismatch'))
      return
    }
    if (password.length < 6) {
      setErr(t('auth.registerPasswordShort'))
      return
    }
    setBusy(true)
    try {
      await apiSignup({ email, full_name: fullName.trim(), password })
      const r = await apiLogin(email, password)
      login(r.access_token)
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t('auth.registerError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40 ring-1 ring-slate-200 dark:ring-slate-700">
        <button
          type="button"
          onClick={toggle}
          className="absolute right-4 top-4 rounded-lg border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          title="Тема"
        >
          {theme === 'dark' ? '☀' : '🌙'}
        </button>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{t('auth.registerTitle')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('auth.registerSubtitle')}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('auth.fullName')}
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('auth.password')}
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('auth.passwordConfirm')}
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>
          {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-600 text-white py-2.5 text-sm font-medium hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? t('auth.registerBusy') : t('auth.registerButton')}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
            {t('auth.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
