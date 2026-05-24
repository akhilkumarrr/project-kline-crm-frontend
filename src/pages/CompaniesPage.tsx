import { useEffect, useMemo, useState } from 'react'
import { ActivityTimeline } from '../components/activities/ActivityTimeline'
import { CompanyEditor, createEmptyCompanyForm } from '../components/companies/CompanyEditor'
import { EmptyState } from '../components/EmptyState'
import { RelatedFilesPanel } from '../components/files/RelatedFilesPanel'
import { LoadState } from '../components/LoadState'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import { readHashParam, readHashRouteState, replaceHashRoute } from '../lib/navigation'
import { api, type CompanyPayload, type CompanyRecord } from '../lib/api'

const toFormState = (company: CompanyRecord): CompanyPayload => ({
  name: company.name || '',
  website: company.website || '',
  industry: company.industry || '',
  phone: company.phone || '',
  email: company.email || '',
  addressLine1: company.addressLine1 || '',
  addressLine2: company.addressLine2 || '',
  city: company.city || '',
  state: company.state || '',
  zipCode: company.zipCode || '',
  country: company.country || '',
  status: company.status || 'active',
  notes: company.notes || '',
})

const trimPayload = (form: CompanyPayload): CompanyPayload =>
  Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  ) as CompanyPayload

export function CompaniesPage() {
  const { token } = useAuth()
  const { notifyError, notifySuccess } = useFeedback()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null)
  const [form, setForm] = useState<CompanyPayload>(createEmptyCompanyForm())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const companiesQuery = useApiQuery(Boolean(token), () => api.getCompanies(token!, 1, 100), [token, refreshKey])

  const companies = companiesQuery.data?.data ?? []
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId) || companies[0] || null

  const detailQuery = useApiQuery(
    Boolean(token) && Boolean(selectedCompany?.id),
    () => api.getCompany(token!, selectedCompany!.id),
    [token, selectedCompany?.id, refreshKey],
  )

  const relatedContactsQuery = useApiQuery(
    Boolean(token) && Boolean(selectedCompany?.id),
    () => api.getCompanyContacts(token!, selectedCompany!.id),
    [token, selectedCompany?.id, refreshKey],
  )

  const relatedLeadsQuery = useApiQuery(
    Boolean(token) && Boolean(selectedCompany?.id),
    () => api.getCompanyLeads(token!, selectedCompany!.id),
    [token, selectedCompany?.id, refreshKey],
  )

  const relatedInvoicesQuery = useApiQuery(
    Boolean(token) && Boolean(selectedCompany?.id),
    () => api.getCompanyInvoices(token!, selectedCompany!.id),
    [token, selectedCompany?.id, refreshKey],
  )

  const relatedTicketsQuery = useApiQuery(
    Boolean(token) && Boolean(selectedCompany?.id),
    () => api.getCompanyTickets(token!, selectedCompany!.id),
    [token, selectedCompany?.id, refreshKey],
  )

  const timelineQuery = useApiQuery(
    Boolean(token) && Boolean(selectedCompany?.id),
    () => api.getCompanyTimeline(token!, selectedCompany!.id),
    [token, selectedCompany?.id, refreshKey],
  )

  useEffect(() => {
    const syncSelectedFromHash = () => {
      if (readHashRouteState().route !== 'companies') {
        return
      }

      const nextSelected = readHashParam('selected')
      if (nextSelected) {
        setSelectedCompanyId(nextSelected)
      }
    }

    syncSelectedFromHash()
    window.addEventListener('hashchange', syncSelectedFromHash)
    return () => window.removeEventListener('hashchange', syncSelectedFromHash)
  }, [])

  useEffect(() => {
    if (!selectedCompanyId && companies[0]) {
      setSelectedCompanyId(companies[0].id)
      return
    }

    if (selectedCompanyId && !companies.some((company) => company.id === selectedCompanyId) && companies[0]) {
      setSelectedCompanyId(companies[0].id)
    }
  }, [companies, selectedCompanyId])

  useEffect(() => {
    if (!selectedCompanyId || readHashRouteState().route !== 'companies') {
      return
    }

    replaceHashRoute('companies', { selected: selectedCompanyId })
  }, [selectedCompanyId])

  const relatedSummary = useMemo(
    () => [
      { label: 'Contacts', value: relatedContactsQuery.data?.length ?? 0 },
      { label: 'Leads', value: relatedLeadsQuery.data?.length ?? 0 },
      { label: 'Invoices', value: relatedInvoicesQuery.data?.length ?? 0 },
      { label: 'Tickets', value: relatedTicketsQuery.data?.length ?? 0 },
    ],
    [relatedContactsQuery.data, relatedInvoicesQuery.data, relatedLeadsQuery.data, relatedTicketsQuery.data],
  )

  const handleFormChange = (field: keyof CompanyPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const openCreate = () => {
    setEditorMode('create')
    setEditingCompanyId(null)
    setForm(createEmptyCompanyForm())
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (companyId: string) => {
    const source = companies.find((company) => company.id === companyId)
    if (!source) {
      return
    }

    setEditorMode('edit')
    setEditingCompanyId(companyId)
    setForm(toFormState(source))
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const handleSave = async () => {
    if (!token) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const payload = trimPayload(form)
      const result =
        editorMode === 'create'
          ? await api.createCompany(token, payload)
          : await api.updateCompany(token, editingCompanyId!, payload)
      setSelectedCompanyId(result.id)
      setIsEditorOpen(false)
      setRefreshKey((current) => current + 1)
      notifySuccess(result.name, editorMode === 'create' ? 'Company created' : 'Company updated')
    } catch (saveFailure) {
      const message = saveFailure instanceof Error ? saveFailure.message : 'Could not save company'
      setSaveError(message)
      notifyError(message, 'Company save failed')
    } finally {
      setIsSaving(false)
    }
  }

  if (companiesQuery.loading) {
    return <LoadState loading title="Loading companies" />
  }

  if (companiesQuery.error) {
    return <LoadState loading={false} error={companiesQuery.error} title="Could not load companies" />
  }

  return (
    <>
      <section className="page-grid">
        <div className="main-column">
          <article className="panel-card">
            <div className="panel-card-header">
              <div>
                <p className="eyebrow">Accounts</p>
                <h3>Companies</h3>
              </div>
              <button type="button" className="primary-button" onClick={openCreate}>
                + New company
              </button>
            </div>

            {companies.length ? (
              <div className="list-shell">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    className={company.id === selectedCompany?.id ? 'list-row active' : 'list-row'}
                    onClick={() => setSelectedCompanyId(company.id)}
                  >
                    <div>
                      <strong>{company.name}</strong>
                      <p>{company.industry || company.website || company.email || 'Account record'}</p>
                    </div>
                    <span className="status-pill neutral">{company.status || 'active'}</span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No companies yet"
                description="Create your first account record to group clients, deals, invoices, and support activity."
                actionLabel="Create company"
                onAction={openCreate}
              />
            )}
          </article>
        </div>

        <aside className="detail-column">
          {selectedCompany ? (
            <>
              <article className="panel-card detail-card">
                <div className="detail-card-header">
                  <div>
                    <p className="eyebrow">Account detail</p>
                    <h3>{selectedCompany.name}</h3>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => openEdit(selectedCompany.id)}>
                    Edit
                  </button>
                </div>

                <div className="detail-stack">
                  <div className="detail-row"><span>Industry</span><strong>{detailQuery.data?.industry || 'Not set'}</strong></div>
                  <div className="detail-row"><span>Website</span><strong>{detailQuery.data?.website || 'Not set'}</strong></div>
                  <div className="detail-row"><span>Email</span><strong>{detailQuery.data?.email || 'Not set'}</strong></div>
                  <div className="detail-row"><span>Phone</span><strong>{detailQuery.data?.phone || 'Not set'}</strong></div>
                </div>

                <div className="mini-stat-grid">
                  {relatedSummary.map((item) => (
                    <div className="mini-stat-card" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel-card">
                <div className="panel-card-header">
                  <div>
                    <p className="eyebrow">Relationship map</p>
                    <h3>Linked records</h3>
                  </div>
                </div>
                <div className="list-shell compact-list">
                  {(relatedContactsQuery.data || []).slice(0, 3).map((contact) => (
                    <div className="list-row static" key={contact.id}>
                      <div>
                        <strong>{`${contact.firstName} ${contact.lastName}`.trim()}</strong>
                        <p>{contact.email}</p>
                      </div>
                    </div>
                  ))}
                  {(relatedLeadsQuery.data || []).slice(0, 2).map((lead) => (
                    <div className="list-row static" key={lead.id}>
                      <div>
                        <strong>{lead.title}</strong>
                        <p>{lead.stage || 'new'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel-card">
                <div className="panel-card-header">
                  <div>
                    <p className="eyebrow">Timeline</p>
                    <h3>Account activity</h3>
                  </div>
                </div>
                <ActivityTimeline
                  emptyMessage="No activity has been logged against this company yet."
                  items={timelineQuery.data || []}
                />
              </article>

              <RelatedFilesPanel
                title="Account files"
                relatedType="company"
                relatedId={selectedCompany.id}
                refreshKey={refreshKey}
                emptyMessage="No files have been attached to this company yet."
              />
            </>
          ) : (
            <EmptyState
              title="Select a company"
              description="Pick an account from the list to review contacts, revenue, and activity in one place."
            />
          )}
        </aside>
      </section>

      <CompanyEditor
        form={form}
        isOpen={isEditorOpen}
        isSaving={isSaving}
        mode={editorMode}
        onChange={handleFormChange}
        onClose={() => !isSaving && setIsEditorOpen(false)}
        onSubmit={handleSave}
        saveError={saveError}
      />
    </>
  )
}
