import type {
  Contract,
  DashboardInsights,
  DashboardStats,
  Document,
  Phase,
  Project,
  RecentTask,
  Task,
  TestRecord,
  User,
} from './types'

const API = ''

function authHeaders(): HeadersInit {
  const t = localStorage.getItem('token')
  const h: Record<string, string> = { Accept: 'application/json' }
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json()
    if (j && typeof j.detail === 'string') return j.detail
    if (Array.isArray(j.detail)) return j.detail.map((x: { msg?: string }) => x.msg).join(', ')
  } catch {
    /* ignore */
  }
  return res.statusText || 'Ошибка запроса'
}

export async function apiLogin(username: string, password: string): Promise<{ access_token: string }> {
  const body = new URLSearchParams({ username, password })
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiMe(): Promise<User> {
  const res = await fetch(`${API}/api/auth/me`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiDashboard(): Promise<DashboardStats> {
  const res = await fetch(`${API}/api/projects/dashboard/stats`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiDashboardInsights(): Promise<DashboardInsights> {
  const res = await fetch(`${API}/api/projects/dashboard/insights`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiRecentTasks(limit = 12): Promise<RecentTask[]> {
  const res = await fetch(`${API}/api/projects/dashboard/recent-tasks?limit=${limit}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiProjects(): Promise<Project[]> {
  const res = await fetch(`${API}/api/projects`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiProject(id: number): Promise<Project> {
  const res = await fetch(`${API}/api/projects/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiCreateProject(data: Partial<Project> & { name: string; code: string }): Promise<Project> {
  const res = await fetch(`${API}/api/projects`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiUpdateProject(id: number, data: Record<string, unknown>): Promise<Project> {
  const res = await fetch(`${API}/api/projects/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiUsers(): Promise<User[]> {
  const res = await fetch(`${API}/api/users`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiTasks(projectId: number): Promise<Task[]> {
  const res = await fetch(`${API}/api/projects/${projectId}/tasks`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiCreateTask(
  projectId: number,
  data: {
    title: string
    description?: string | null
    status?: Task['status']
    priority?: number
    assignee_id?: number | null
    phase_id?: number | null
    due_date?: string | null
  },
): Promise<Task> {
  const res = await fetch(`${API}/api/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiUpdateTask(
  projectId: number,
  taskId: number,
  data: Record<string, unknown>,
): Promise<Task> {
  const res = await fetch(`${API}/api/projects/${projectId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiPhases(projectId: number): Promise<Phase[]> {
  const res = await fetch(`${API}/api/projects/${projectId}/phases`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiContracts(projectId: number): Promise<Contract[]> {
  const res = await fetch(`${API}/api/projects/${projectId}/contracts`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiDocuments(projectId: number): Promise<Document[]> {
  const res = await fetch(`${API}/api/projects/${projectId}/documents`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiTests(projectId: number): Promise<TestRecord[]> {
  const res = await fetch(`${API}/api/projects/${projectId}/tests`, { headers: authHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiCreateTest(
  projectId: number,
  data: {
    name: string
    test_type?: string | null
    location?: string | null
    performed_at?: string | null
    result_summary?: string | null
    protocol_ref?: string | null
  },
): Promise<TestRecord> {
  const res = await fetch(`${API}/api/projects/${projectId}/tests`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}
