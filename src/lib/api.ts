const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1'
const TOKEN_STORAGE_KEY = 'project-kline-crm-token'

type RequestOptions = {
  body?: unknown
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string | null
}

export type LoginResponse = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  permissions?: string[] | null
  token: string
}

export type CurrentUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status?: string
  phone?: string | null
  teamId?: string | null
  permissions?: string[] | null
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export type ContactRecord = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  company?: string | null
  jobTitle?: string | null
  type?: string
  status?: string
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  notes?: string | null
  ownerId?: string
  owner?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  createdAt?: string
  updatedAt?: string
}

export type ContactPayload = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  type?: string
  status?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  notes?: string
}

export type LeadRecord = {
  id: string
  title: string
  description?: string | null
  contactId: string
  contact?: ContactRecord | null
  stage?: string
  source?: string
  value?: number | string | null
  probability?: string | null
  expectedCloseDate?: string | null
  ownerId?: string
  owner?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export type LeadPayload = {
  title: string
  description?: string
  contactId: string
  stage?: string
  source?: string
  value?: number
  probability?: string
  expectedCloseDate?: string
  notes?: string
}

export type TaskRecord = {
  id: string
  title: string
  description?: string | null
  status?: string
  priority?: string
  dueDate?: string | null
  category?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
  ownerId?: string
  owner?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  assignedTo?: string | null
  assignedUser?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  reminderSent?: boolean
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
}

export type TaskPayload = {
  title: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string
  category?: string
  assignedTo?: string
  relatedEntityType?: string
  relatedEntityId?: string
}

export type AppointmentRecord = {
  id: string
  title: string
  description?: string | null
  type?: string
  status?: string
  startAt?: string | null
  endAt?: string | null
  location?: string | null
  contactId?: string | null
  contact?: ContactRecord | null
  leadId?: string | null
  lead?: LeadRecord | null
  ownerId?: string
  owner?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  assignedTo?: string | null
  assignedUser?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  attendees?: string[] | null
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
}

export type AppointmentPayload = {
  title: string
  description?: string
  type?: string
  status?: string
  startAt: string
  endAt: string
  location?: string
  contactId?: string
  leadId?: string
  assignedTo?: string
}

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '')

async function request<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed with status ${response.status}`

    throw new Error(Array.isArray(message) ? message.join(', ') : message)
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

export const tokenStorage = {
  get() {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  },
  set(token: string) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  },
  clear() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  },
}

export const api = {
  baseUrl: apiBaseUrl,
  login(email: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  },
  getProfile(token: string) {
    return request<CurrentUser>('/auth/me', { token })
  },
  getContacts(token: string, page = 1, limit = 20) {
    return request<PaginatedResponse<ContactRecord>>(`/contacts?page=${page}&limit=${limit}`, {
      token,
    })
  },
  createContact(token: string, payload: ContactPayload) {
    return request<ContactRecord>('/contacts', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateContact(token: string, contactId: string, payload: Partial<ContactPayload>) {
    return request<ContactRecord>(`/contacts/${contactId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  getLeads(token: string, page = 1, limit = 20) {
    return request<PaginatedResponse<LeadRecord>>(`/leads?page=${page}&limit=${limit}`, {
      token,
    })
  },
  createLead(token: string, payload: LeadPayload) {
    return request<LeadRecord>('/leads', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateLead(token: string, leadId: string, payload: Partial<LeadPayload>) {
    return request<LeadRecord>(`/leads/${leadId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  getTasks(token: string, page = 1, limit = 20) {
    return request<PaginatedResponse<TaskRecord>>(`/tasks?page=${page}&limit=${limit}`, {
      token,
    })
  },
  createTask(token: string, payload: TaskPayload) {
    return request<TaskRecord>('/tasks', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateTask(token: string, taskId: string, payload: Partial<TaskPayload>) {
    return request<TaskRecord>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  updateTaskStatus(token: string, taskId: string, status: string) {
    return request<TaskRecord>(`/tasks/${taskId}/status`, {
      method: 'PUT',
      body: { status },
      token,
    })
  },
  getAppointments(token: string) {
    return request<AppointmentRecord[]>('/appointments', { token })
  },
  createAppointment(token: string, payload: AppointmentPayload) {
    return request<AppointmentRecord>('/appointments', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateAppointment(token: string, appointmentId: string, payload: Partial<AppointmentPayload>) {
    return request<AppointmentRecord>(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  getInvoices(token: string) {
    return request<any[]>('/invoices', { token })
  },
  getOnboardingWorkflows(token: string) {
    return request<any[]>('/onboarding-workflows', { token })
  },
  getTickets(token: string) {
    return request<any[]>('/tickets', { token })
  },
  getAnalyticsPipeline(token: string) {
    return request<any>('/analytics/pipeline', { token })
  },
  getAnalyticsForecast(token: string) {
    return request<any>('/analytics/pipeline/forecast', { token })
  },
  getAnalyticsActivitySummary(token: string) {
    return request<any>('/analytics/activity-summary', { token })
  },
  getAnalyticsLeadSources(token: string) {
    return request<any[]>('/analytics/lead-sources', { token })
  },
  getAnalyticsQuoteMetrics(token: string) {
    return request<any>('/analytics/quote-metrics', { token })
  },
  getUsers(token: string, page = 1, limit = 20) {
    return request<PaginatedResponse<any>>(`/users?page=${page}&limit=${limit}`, {
      token,
    })
  },
  getTeams(token: string) {
    return request<any[]>('/teams', { token })
  },
}
