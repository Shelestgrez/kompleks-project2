export type UserRole = 'admin' | 'pm' | 'engineer' | 'viewer'

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
}

export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed'

export interface Project {
  id: number
  name: string
  code: string
  description: string | null
  customer_name: string | null
  object_address: string | null
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  manager_id: number | null
  created_at: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

export interface Task {
  id: number
  project_id: number
  phase_id: number | null
  title: string
  description: string | null
  status: TaskStatus
  priority: number
  assignee_id: number | null
  due_date: string | null
  created_at: string
  updated_at?: string | null
}

export interface Contract {
  id: number
  project_id: number
  number: string
  signed_date: string | null
  amount: number | null
  notes: string | null
}

export interface Phase {
  id: number
  project_id: number
  name: string
  sort_order: number
  start_date: string | null
  end_date: string | null
}

export interface Document {
  id: number
  project_id: number
  title: string
  doc_type: string | null
  version: string
  status: 'draft' | 'review' | 'approved'
  file_path: string | null
  uploaded_by_id: number | null
  created_at: string
}

export interface TestRecord {
  id: number
  project_id: number
  name: string
  test_type: string | null
  location: string | null
  performed_at: string | null
  result_summary: string | null
  protocol_ref: string | null
}

export interface DashboardStats {
  projects_total: number
  projects_active: number
  tasks_open: number
  tasks_overdue: number
}

export interface DashboardInsights {
  tasks_by_status: Record<string, number>
  projects_by_status: Record<string, number>
  documents_total: number
  tests_total: number
}

export interface RecentTask {
  id: number
  title: string
  status: TaskStatus
  project_id: number
  project_code: string
  project_name: string
  due_date: string | null
  updated_at: string | null
  assignee_name: string | null
}
