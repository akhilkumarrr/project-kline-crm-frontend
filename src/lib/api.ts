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
    return request<PaginatedResponse<any>>(`/contacts?page=${page}&limit=${limit}`, {
      token,
    })
  },
  getLeads(token: string, page = 1, limit = 20) {
    return request<PaginatedResponse<any>>(`/leads?page=${page}&limit=${limit}`, {
      token,
    })
  },
  getTasks(token: string, page = 1, limit = 20) {
    return request<PaginatedResponse<any>>(`/tasks?page=${page}&limit=${limit}`, {
      token,
    })
  },
  getAppointments(token: string) {
    return request<any[]>('/appointments', { token })
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
