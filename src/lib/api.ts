const DEFAULT_API_BASE_URL = '/api/v1'
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

export type QuoteLineItem = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export type QuoteRecord = {
  id: string
  quoteNumber: string
  contactId: string
  contact?: ContactRecord | null
  status?: string
  description?: string | null
  lineItems?: QuoteLineItem[] | null
  subtotal?: number | string | null
  taxPercent?: number | string | null
  taxAmount?: number | string | null
  total?: number | string | null
  validUntil?: string | null
  sentAt?: string | null
  acceptedAt?: string | null
  createdById?: string
  createdBy?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export type QuotePayload = {
  quoteNumber: string
  contactId: string
  description?: string
  lineItems: QuoteLineItem[]
  subtotal: number
  taxPercent: number
  taxAmount: number
  total: number
  validUntil?: string
  notes?: string
}

export type ContractRecord = {
  id: string
  title: string
  contractNumber: string
  contactId: string
  contact?: ContactRecord | null
  status?: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  value?: number | string | null
  paymentTerms?: string | null
  notes?: string | null
  customFields?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
}

export type ContractPayload = {
  title: string
  contractNumber: string
  contactId: string
  status?: string
  description?: string
  startDate: string
  endDate: string
  value: number
  paymentTerms?: string
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

export type InvoiceRecord = {
  id: string
  invoiceNumber: string
  contactId: string
  contact?: ContactRecord | null
  quoteId?: string | null
  contractId?: string | null
  status?: string
  totalAmount?: number | string | null
  paidAmount?: number | string | null
  balanceDue?: number | string | null
  issuedDate?: string | null
  dueDate?: string | null
  paidAt?: string | null
  paymentMethod?: string | null
  notes?: string | null
  ownerId?: string
  createdAt?: string
  updatedAt?: string
}

export type InvoicePayload = {
  invoiceNumber: string
  contactId: string
  quoteId?: string
  contractId?: string
  status?: string
  totalAmount: number
  paidAmount?: number
  issuedDate: string
  dueDate?: string
  paidAt?: string
  paymentMethod?: string
  notes?: string
}

export type TicketRecord = {
  id: string
  ticketNumber: string
  subject: string
  description: string
  contactId: string
  contact?: ContactRecord | null
  ownerId?: string
  assignedTo?: string | null
  assignedUser?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  status?: string
  priority?: string
  source?: string
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
}

export type TicketPayload = {
  ticketNumber: string
  subject: string
  description: string
  contactId: string
  assignedTo?: string
  status?: string
  priority?: string
  source?: string
}

export type OnboardingWorkflowRecord = {
  id: string
  name: string
  description?: string | null
  contactId?: string | null
  contact?: ContactRecord | null
  leadId?: string | null
  lead?: LeadRecord | null
  ownerId?: string
  assignedTo?: string | null
  assignedUser?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  status?: string
  startDate?: string | null
  dueDate?: string | null
  steps?:
    | Array<{
        id: string
        title: string
        completed: boolean
        dueDate?: string
        notes?: string
      }>
    | null
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
}

export type OnboardingWorkflowPayload = {
  name: string
  description?: string
  contactId?: string
  leadId?: string
  assignedTo?: string
  status?: string
  startDate?: string
  dueDate?: string
}

export type SavedSearchRecord = {
  id: string
  name: string
  entityType: string
  filters: Record<string, unknown>
  userId: string
  createdAt?: string
  updatedAt?: string
}

export type SavedSearchPayload = {
  name: string
  entityType: string
  filters: Record<string, unknown>
}

export type GlobalSearchResults = {
  contacts?: ContactRecord[]
  leads?: LeadRecord[]
  quotes?: QuoteRecord[]
  contracts?: ContractRecord[]
  tasks?: TaskRecord[]
}

export type EmailTemplateVariable = {
  name: string
  example: string
  description?: string
}

export type EmailTemplateRecord = {
  id: string
  name: string
  subject: string
  body: string
  variables?: EmailTemplateVariable[] | null
  templateType?: string
  isActive?: boolean
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export type EmailTemplatePayload = {
  name: string
  subject: string
  body: string
  variables?: EmailTemplateVariable[]
  templateType?: string
}

export type EmailLogRecord = {
  id: string
  to: string
  cc?: string | null
  bcc?: string | null
  subject: string
  body: string
  status?: string
  error?: string | null
  metadata?: Record<string, unknown> | null
  openedAt?: string | null
  clickedAt?: string | null
  messageId?: string | null
  sentBy?: string | null
  sentAt?: string
}

export type EntityEmailSendPayload = {
  toEmail: string
  templateId?: string
}

export type SendEmailPayload = {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  metadata?: Record<string, unknown>
}

export type ActivityRecord = {
  id: string
  userId: string
  relatedType: string
  relatedId: string
  type: string
  description?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string
}

export type AddNotePayload = {
  note: string
  metadata?: Record<string, unknown>
}

export type CreateActivityPayload = {
  relatedType: string
  relatedId: string
  type: string
  description?: string
  metadata?: Record<string, unknown>
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

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    search.set(key, String(value))
  })

  const query = search.toString()
  return query ? `?${query}` : ''
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
  getQuotes(token: string, page = 1, limit = 20) {
    return request<PaginatedResponse<QuoteRecord>>(`/quotes?page=${page}&limit=${limit}`, {
      token,
    })
  },
  createQuote(token: string, payload: QuotePayload) {
    return request<QuoteRecord>('/quotes', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateQuote(token: string, quoteId: string, payload: Partial<QuotePayload>) {
    return request<QuoteRecord>(`/quotes/${quoteId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  updateQuoteStatus(token: string, quoteId: string, status: string) {
    return request<QuoteRecord>(`/quotes/${quoteId}/status`, {
      method: 'PUT',
      body: { status },
      token,
    })
  },
  getContracts(token: string, page = 1, limit = 20) {
    return request<PaginatedResponse<ContractRecord>>(
      `/contracts?page=${page}&limit=${limit}`,
      {
        token,
      },
    )
  },
  createContract(token: string, payload: ContractPayload) {
    return request<ContractRecord>('/contracts', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateContract(token: string, contractId: string, payload: Partial<ContractPayload>) {
    return request<ContractRecord>(`/contracts/${contractId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  updateContractStatus(token: string, contractId: string, status: string) {
    return request<ContractRecord>(`/contracts/${contractId}/status`, {
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
    return request<InvoiceRecord[]>('/invoices', { token })
  },
  createInvoice(token: string, payload: InvoicePayload) {
    return request<InvoiceRecord>('/invoices', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateInvoice(token: string, invoiceId: string, payload: Partial<InvoicePayload>) {
    return request<InvoiceRecord>(`/invoices/${invoiceId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  getTickets(token: string) {
    return request<TicketRecord[]>('/tickets', { token })
  },
  createTicket(token: string, payload: TicketPayload) {
    return request<TicketRecord>('/tickets', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateTicket(token: string, ticketId: string, payload: Partial<TicketPayload>) {
    return request<TicketRecord>(`/tickets/${ticketId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  getOnboardingWorkflows(token: string) {
    return request<OnboardingWorkflowRecord[]>('/onboarding-workflows', { token })
  },
  createOnboardingWorkflow(token: string, payload: OnboardingWorkflowPayload) {
    return request<OnboardingWorkflowRecord>('/onboarding-workflows', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateOnboardingWorkflow(
    token: string,
    workflowId: string,
    payload: Partial<OnboardingWorkflowPayload>,
  ) {
    return request<OnboardingWorkflowRecord>(`/onboarding-workflows/${workflowId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  getContactTimeline(token: string, contactId: string) {
    return request<ActivityRecord[]>(`/contacts/${contactId}/timeline`, { token })
  },
  getContactCommunications(token: string, contactId: string) {
    return request<ActivityRecord[]>(`/contacts/${contactId}/communications`, { token })
  },
  addContactNote(token: string, contactId: string, payload: AddNotePayload) {
    return request<ActivityRecord>(`/contacts/${contactId}/notes`, {
      method: 'POST',
      body: payload,
      token,
    })
  },
  getLeadTimeline(token: string, leadId: string) {
    return request<ActivityRecord[]>(`/leads/${leadId}/timeline`, { token })
  },
  getLeadActivities(token: string, leadId: string) {
    return request<ActivityRecord[]>(`/leads/${leadId}/activities`, { token })
  },
  createActivity(token: string, payload: CreateActivityPayload) {
    return request<ActivityRecord>('/activities', {
      method: 'POST',
      body: payload,
      token,
    })
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
  globalSearch(token: string, q: string, entityType?: string) {
    return request<GlobalSearchResults>(
      `/search/global${buildQuery({ entityType, q })}`,
      { token },
    )
  },
  advancedContactSearch(
    token: string,
    filters: Record<string, string | number | boolean | undefined | null>,
  ) {
    return request<ContactRecord[]>(`/contacts/advanced-search${buildQuery(filters)}`, {
      token,
    })
  },
  advancedLeadSearch(
    token: string,
    filters: Record<string, string | number | boolean | undefined | null>,
  ) {
    return request<LeadRecord[]>(`/leads/advanced-search${buildQuery(filters)}`, {
      token,
    })
  },
  getSavedSearches(token: string) {
    return request<SavedSearchRecord[]>('/saved-searches', { token })
  },
  createSavedSearch(token: string, payload: SavedSearchPayload) {
    return request<SavedSearchRecord>('/saved-searches', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateSavedSearch(token: string, savedSearchId: string, payload: Partial<SavedSearchPayload>) {
    return request<SavedSearchRecord>(`/saved-searches/${savedSearchId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  deleteSavedSearch(token: string, savedSearchId: string) {
    return request<{ message: string }>(`/saved-searches/${savedSearchId}`, {
      method: 'DELETE',
      token,
    })
  },
  getEmailTemplates(token: string, page = 1, limit = 100) {
    return request<PaginatedResponse<EmailTemplateRecord>>(
      `/email/templates${buildQuery({ page, limit })}`,
      { token },
    )
  },
  createEmailTemplate(token: string, payload: EmailTemplatePayload) {
    return request<EmailTemplateRecord>('/email/templates', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  updateEmailTemplate(
    token: string,
    templateId: string,
    payload: Partial<EmailTemplatePayload>,
  ) {
    return request<EmailTemplateRecord>(`/email/templates/${templateId}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },
  deleteEmailTemplate(token: string, templateId: string) {
    return request<{ message: string }>(`/email/templates/${templateId}`, {
      method: 'DELETE',
      token,
    })
  },
  sendEmail(token: string, payload: SendEmailPayload) {
    return request<EmailLogRecord>('/email/send', {
      method: 'POST',
      body: payload,
      token,
    })
  },
  getEmailLogs(token: string, page = 1, limit = 100, status?: string) {
    return request<PaginatedResponse<EmailLogRecord>>(
      `/email/logs${buildQuery({ page, limit, status })}`,
      { token },
    )
  },
  resendEmail(token: string, emailLogId: string) {
    return request<EmailLogRecord>(`/email/logs/${emailLogId}/resend`, {
      method: 'POST',
      token,
    })
  },
  getEntityEmailLogs(token: string, entityType: string, entityId: string) {
    return request<EmailLogRecord[]>(`/email/logs/entity/${entityType}/${entityId}`, {
      token,
    })
  },
  sendQuoteViaEmail(token: string, quoteId: string, payload: EntityEmailSendPayload) {
    return request<EmailLogRecord>(`/email/send-quote/${quoteId}`, {
      method: 'POST',
      body: payload,
      token,
    })
  },
  sendContractViaEmail(token: string, contractId: string, payload: EntityEmailSendPayload) {
    return request<EmailLogRecord>(`/email/send-contract/${contractId}`, {
      method: 'POST',
      body: payload,
      token,
    })
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
