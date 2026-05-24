import { useEffect, useMemo, useState } from 'react'
import { LoadState } from '../LoadState'
import {
  AppointmentEditor,
  createEmptyAppointmentForm,
  normalizeAppointmentForm,
} from './AppointmentEditor'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import {
  api,
  type AppointmentPayload,
  type AppointmentRecord,
  type CurrentUser,
} from '../../lib/api'

type AppointmentViewModel = {
  assignee: string
  contactLabel: string
  dayLabel: string
  description?: string | null
  endAt?: string | null
  id: string
  leadLabel: string
  location?: string | null
  startAt?: string | null
  status: string
  timeRange: string
  title: string
  tone: string
  type: string
}

const formatTitleCase = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const formatDateValue = (value?: string | null) => {
  if (!value) {
    return 'Unscheduled'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const formatTimeRange = (startAt?: string | null, endAt?: string | null) => {
  if (!startAt || !endAt) {
    return 'Time TBD'
  }

  const start = new Date(startAt)
  const end = new Date(endAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Time TBD'
  }

  return `${start.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${end.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`
}

const buildAppointmentTone = (status?: string) => {
  switch (status) {
    case 'completed':
      return 'healthy'
    case 'confirmed':
      return 'cool'
    case 'cancelled':
    case 'no_show':
      return 'risk'
    default:
      return 'watching'
  }
}

const mapAppointment = (appointment: AppointmentRecord): AppointmentViewModel => ({
  assignee:
    `${appointment.assignedUser?.firstName || ''} ${appointment.assignedUser?.lastName || ''}`.trim() ||
    appointment.assignedUser?.email ||
    'Unassigned',
  contactLabel:
    `${appointment.contact?.firstName || ''} ${appointment.contact?.lastName || ''}`.trim() ||
    appointment.contact?.company ||
    'No contact',
  dayLabel: formatDateValue(appointment.startAt),
  description: appointment.description,
  endAt: appointment.endAt,
  id: appointment.id,
  leadLabel: appointment.lead?.title || 'No lead',
  location: appointment.location,
  startAt: appointment.startAt,
  status: appointment.status || 'scheduled',
  timeRange: formatTimeRange(appointment.startAt, appointment.endAt),
  title: appointment.title,
  tone: buildAppointmentTone(appointment.status),
  type: appointment.type || 'meeting',
})

const toFormState = (appointment: AppointmentRecord): AppointmentPayload => ({
  assignedTo: appointment.assignedTo || '',
  contactId: appointment.contactId || '',
  description: appointment.description || '',
  endAt: appointment.endAt || '',
  leadId: appointment.leadId || '',
  location: appointment.location || '',
  startAt: appointment.startAt || '',
  status: appointment.status || 'scheduled',
  title: appointment.title || '',
  type: appointment.type || 'meeting',
})

const trimAppointmentPayload = (form: AppointmentPayload): AppointmentPayload => ({
  assignedTo: form.assignedTo?.trim() || undefined,
  contactId: form.contactId?.trim() || undefined,
  description: form.description?.trim() || undefined,
  endAt: form.endAt,
  leadId: form.leadId?.trim() || undefined,
  location: form.location?.trim() || undefined,
  startAt: form.startAt,
  status: form.status?.trim() || undefined,
  title: form.title.trim(),
  type: form.type?.trim() || undefined,
})

export function AppointmentsWorkspace() {
  const { token } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [form, setForm] = useState<AppointmentPayload>(createEmptyAppointmentForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const appointmentsQuery = useApiQuery(
    Boolean(token),
    () => api.getAppointments(token!),
    [token, refreshKey],
  )
  const contactsQuery = useApiQuery(
    Boolean(token),
    () => api.getContacts(token!, 1, 100),
    [token],
  )
  const leadsQuery = useApiQuery(
    Boolean(token),
    () => api.getLeads(token!, 1, 100),
    [token],
  )
  const usersQuery = useApiQuery(
    Boolean(token),
    () => api.getUsers(token!, 1, 100),
    [token],
  )

  const contacts = contactsQuery.data?.data ?? []
  const leads = leadsQuery.data?.data ?? []
  const users = (usersQuery.data?.data ?? []) as CurrentUser[]
  const appointments = (appointmentsQuery.data ?? []).map(mapAppointment)

  const groupedAppointments = useMemo(() => {
    const groups = new Map<string, AppointmentViewModel[]>()

    for (const appointment of appointments) {
      const existing = groups.get(appointment.dayLabel) ?? []
      existing.push(appointment)
      groups.set(appointment.dayLabel, existing)
    }

    return Array.from(groups.entries()).map(([dayLabel, dayAppointments]) => ({
      dayLabel,
      items: dayAppointments,
    }))
  }, [appointments])

  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ||
    appointments[0] ||
    null

  useEffect(() => {
    if (!selectedAppointmentId && appointments[0]) {
      setSelectedAppointmentId(appointments[0].id)
      return
    }

    if (
      selectedAppointmentId &&
      !appointments.some((appointment) => appointment.id === selectedAppointmentId) &&
      appointments[0]
    ) {
      setSelectedAppointmentId(appointments[0].id)
    }
  }, [appointments, selectedAppointmentId])

  const handleFormChange = (field: keyof AppointmentPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const openCreate = () => {
    const now = new Date()
    const end = new Date(now.getTime() + 60 * 60 * 1000)

    setEditorMode('create')
    setEditingAppointmentId(null)
    setForm(
      normalizeAppointmentForm({
        ...createEmptyAppointmentForm(),
        endAt: end.toISOString(),
        startAt: now.toISOString(),
      }),
    )
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (appointmentId: string) => {
    const source = appointmentsQuery.data?.find((appointment) => appointment.id === appointmentId)
    if (!source) {
      return
    }

    setEditorMode('edit')
    setEditingAppointmentId(appointmentId)
    setForm(normalizeAppointmentForm(toFormState(source)))
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const closeEditor = () => {
    if (isSaving) {
      return
    }

    setIsEditorOpen(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!token) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const payload = trimAppointmentPayload(form)

      if (editorMode === 'create') {
        const created = await api.createAppointment(token, payload)
        setSelectedAppointmentId(created.id)
      } else if (editingAppointmentId) {
        const updated = await api.updateAppointment(token, editingAppointmentId, payload)
        setSelectedAppointmentId(updated.id)
      }

      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save appointment')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <section className="page-grid">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Scheduling</p>
                <h3>Appointments and calendar</h3>
              </div>
              <div className="inline-actions">
                <span className="pill cool">
                  {appointments.length ? `${appointments.length} booked` : 'Schedule queue'}
                </span>
                <button type="button" className="primary-button" onClick={openCreate}>
                  + New appointment
                </button>
              </div>
            </div>

            <LoadState
              loading={
                appointmentsQuery.loading ||
                contactsQuery.loading ||
                leadsQuery.loading ||
                usersQuery.loading
              }
              error={
                appointmentsQuery.error ||
                contactsQuery.error ||
                leadsQuery.error ||
                usersQuery.error
              }
              title="Loading appointments"
            />

            <div className="schedule-board">
              {groupedAppointments.length ? (
                groupedAppointments.map((group) => (
                  <section className="schedule-column" key={group.dayLabel}>
                    <header className="schedule-day">
                      <strong>{group.dayLabel}</strong>
                      <span>{group.items.length} meetings</span>
                    </header>

                    <div className="schedule-stack">
                      {group.items.map((appointment) => (
                        <article
                          className={
                            appointment.id === selectedAppointment?.id
                              ? 'schedule-card selected-schedule-card'
                              : 'schedule-card'
                          }
                          key={appointment.id}
                        >
                          <button
                            type="button"
                            className="schedule-button"
                            onClick={() => setSelectedAppointmentId(appointment.id)}
                          >
                            <div className="schedule-topline">
                              <span className={`schedule-tag ${appointment.tone}`}>
                                {formatTitleCase(appointment.type)}
                              </span>
                              <b>{appointment.timeRange}</b>
                            </div>
                            <strong>{appointment.title}</strong>
                            <p>{appointment.description || appointment.location || appointment.contactLabel}</p>
                          </button>

                          <button
                            type="button"
                            className="ghost-button compact-button"
                            onClick={() => openEdit(appointment.id)}
                          >
                            Edit
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="empty-card">No appointments scheduled yet.</div>
              )}
            </div>
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Selected appointment</p>
                <h3>{selectedAppointment?.title || 'Appointment detail'}</h3>
              </div>
              {selectedAppointment ? (
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => openEdit(selectedAppointment.id)}
                >
                  Edit appointment
                </button>
              ) : null}
            </div>

            {selectedAppointment ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <span className="data-label">When</span>
                    <strong>{selectedAppointment.dayLabel}</strong>
                  </div>
                  <div>
                    <span className="data-label">Time</span>
                    <strong>{selectedAppointment.timeRange}</strong>
                  </div>
                  <div>
                    <span className="data-label">Status</span>
                    <strong>{formatTitleCase(selectedAppointment.status)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Type</span>
                    <strong>{formatTitleCase(selectedAppointment.type)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Contact</span>
                    <strong>{selectedAppointment.contactLabel}</strong>
                  </div>
                  <div>
                    <span className="data-label">Lead</span>
                    <strong>{selectedAppointment.leadLabel}</strong>
                  </div>
                  <div>
                    <span className="data-label">Assigned to</span>
                    <strong>{selectedAppointment.assignee}</strong>
                  </div>
                  <div>
                    <span className="data-label">Location</span>
                    <strong>{selectedAppointment.location || 'TBD'}</strong>
                  </div>
                </div>

                <div className="detail-note">
                  <span className="data-label">Description</span>
                  <p>
                    {selectedAppointment.description ||
                      'No additional notes have been added to this appointment yet.'}
                  </p>
                </div>
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <AppointmentEditor
        contacts={contacts}
        form={form}
        isOpen={isEditorOpen}
        isSaving={isSaving}
        leads={leads}
        mode={editorMode}
        onChange={handleFormChange}
        onClose={closeEditor}
        onSubmit={handleSave}
        saveError={saveError}
        users={users}
      />
    </>
  )
}
