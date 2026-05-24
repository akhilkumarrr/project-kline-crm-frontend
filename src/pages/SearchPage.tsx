import { useEffect, useMemo, useState } from 'react'
import { navigateToRoute } from '../lib/navigation'
import { LoadState } from '../components/LoadState'
import { useAuth } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import { useWorkspaceTemplate } from '../hooks/useWorkspaceTemplate'
import {
  api,
  type ContactRecord,
  type ContractRecord,
  type GlobalSearchResults,
  type LeadRecord,
  type QuoteRecord,
  type SavedSearchPayload,
  type SavedSearchRecord,
  type TaskRecord,
} from '../lib/api'

type SearchEntity = 'all' | 'contacts' | 'leads' | 'quotes' | 'contracts' | 'tasks'

const readSearchState = () => {
  const raw = window.location.hash.split('?')[1] || ''
  const params = new URLSearchParams(raw)
  return {
    entity: (params.get('entity') as SearchEntity | null) || 'all',
    q: params.get('q') || '',
  }
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'No date'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
}

const countResults = (results: GlobalSearchResults | null) =>
  ['contacts', 'leads', 'quotes', 'contracts', 'tasks'].reduce((sum, key) => {
    const records = results?.[key as keyof GlobalSearchResults]
    return sum + (Array.isArray(records) ? records.length : 0)
  }, 0)

export function SearchPage() {
  const { token } = useAuth()
  const { confirm, notifyError, notifySuccess } = useFeedback()
  const { labels, pipelineStages } = useWorkspaceTemplate()
  const [q, setQ] = useState(readSearchState().q)
  const [entity, setEntity] = useState<SearchEntity>(readSearchState().entity)
  const [results, setResults] = useState<GlobalSearchResults | null>(null)
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>([])
  const [loading, setLoading] = useState(Boolean(readSearchState().q))
  const [error, setError] = useState<string | null>(null)
  const [saveName, setSaveName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [contactFilters, setContactFilters] = useState({
    company: '',
    q: '',
    status: '',
  })
  const [leadFilters, setLeadFilters] = useState({
    q: '',
    source: '',
    stage: '',
  })
  const [advancedContacts, setAdvancedContacts] = useState<ContactRecord[] | null>(null)
  const [advancedLeads, setAdvancedLeads] = useState<LeadRecord[] | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const syncFromHash = () => {
      const state = readSearchState()
      setQ(state.q)
      setEntity(state.entity)
    }

    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  useEffect(() => {
    if (!token) {
      return
    }

    api
      .getSavedSearches(token)
      .then(setSavedSearches)
      .catch((nextError: Error) => setError(nextError.message))
  }, [token, refreshKey])

  useEffect(() => {
    if (!token || !q.trim()) {
      setResults(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    api
      .globalSearch(token, q.trim(), entity === 'all' ? undefined : entity)
      .then((payload) => {
        setResults(payload)
        setAdvancedContacts(null)
        setAdvancedLeads(null)
      })
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false))
  }, [entity, q, token])

  const totalResults = useMemo(() => countResults(results), [results])
  const entityOptions: Array<{ label: string; value: SearchEntity }> = [
    { label: 'All records', value: 'all' },
    { label: labels.contactPlural, value: 'contacts' },
    { label: 'Leads', value: 'leads' },
    { label: 'Quotes', value: 'quotes' },
    { label: 'Contracts', value: 'contracts' },
    { label: 'Tasks', value: 'tasks' },
  ]

  const submitSearch = () => {
    const params = new URLSearchParams()
    if (q.trim()) {
      params.set('q', q.trim())
    }
    if (entity !== 'all') {
      params.set('entity', entity)
    }
    window.location.hash = `/search${params.toString() ? `?${params.toString()}` : ''}`
  }

  const saveCurrentSearch = async () => {
    if (!token) {
      return
    }

    const name = saveName.trim()
    const query = q.trim()

    if (!name || !query) {
      setSaveError('Add a saved search name and a search query first.')
      return
    }

    setSaveError(null)
    const payload: SavedSearchPayload = {
      entityType: entity === 'all' ? 'global' : entity,
      filters: { entityType: entity, q: query },
      name,
    }

    try {
      await api.createSavedSearch(token, payload)
      setSaveName('')
      setRefreshKey((current) => current + 1)
      notifySuccess(`Saved "${name}" for quick access later.`, 'Search saved')
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unable to save search.'
      setSaveError(message)
      notifyError(message, 'Search not saved')
    }
  }

  const runSavedSearch = (search: SavedSearchRecord) => {
    const nextQ = String(search.filters?.q || '')
    const nextEntity = String(search.filters?.entityType || search.entityType || 'all')
    const params = new URLSearchParams()
    if (nextQ) {
      params.set('q', nextQ)
    }
    if (nextEntity && nextEntity !== 'all' && nextEntity !== 'global') {
      params.set('entity', nextEntity)
    }
    window.location.hash = `/search${params.toString() ? `?${params.toString()}` : ''}`
  }

  const deleteSavedSearch = async (id: string) => {
    if (!token) {
      return
    }

    const savedSearch = savedSearches.find((search) => search.id === id)
    const confirmed = await confirm({
      confirmLabel: 'Delete view',
      description: `Remove ${savedSearch?.name || 'this saved search'} from the workspace shortcuts?`,
      title: 'Delete saved search?',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    try {
      await api.deleteSavedSearch(token, id)
      setRefreshKey((current) => current + 1)
      notifySuccess('The saved view was removed.', 'Saved search deleted')
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unable to delete saved search.'
      setSaveError(message)
      notifyError(message, 'Delete failed')
    }
  }

  const runAdvancedContactSearch = async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await api.advancedContactSearch(token, contactFilters)
      setAdvancedContacts(data)
      setAdvancedLeads(null)
      setResults(null)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : `Unable to search ${labels.contactPlural.toLowerCase()}.`)
    } finally {
      setLoading(false)
    }
  }

  const runAdvancedLeadSearch = async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await api.advancedLeadSearch(token, leadFilters)
      setAdvancedLeads(data)
      setAdvancedContacts(null)
      setResults(null)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to search leads.')
    } finally {
      setLoading(false)
    }
  }

  const renderContactRow = (contact: ContactRecord) => (
    <div className="table-row stacked-row" key={contact.id}>
      <div>
        <strong>{`${contact.firstName} ${contact.lastName}`.trim()}</strong>
        <p>{contact.company || contact.email}</p>
      </div>
      <div className="inline-actions">
        <b>{contact.status || 'active'}</b>
        <span>{contact.phone || 'No phone'}</span>
        <button
          type="button"
          className="ghost-button compact-button"
          onClick={() => navigateToRoute('contacts', { selected: contact.id })}
        >
          Open
        </button>
      </div>
    </div>
  )

  const renderLeadRow = (lead: LeadRecord) => (
    <div className="table-row stacked-row" key={lead.id}>
      <div>
        <strong>{lead.title}</strong>
        <p>{lead.contact?.company || lead.contact?.email || 'Lead record'}</p>
      </div>
      <div className="inline-actions">
        <b>{lead.stage || 'new'}</b>
        <span>{lead.source || 'Unknown source'}</span>
        <button
          type="button"
          className="ghost-button compact-button"
          onClick={() => navigateToRoute('pipeline', { selected: lead.id })}
        >
          Open
        </button>
      </div>
    </div>
  )

  const renderQuoteRow = (quote: QuoteRecord) => (
    <div className="table-row stacked-row" key={quote.id}>
      <div>
        <strong>{quote.quoteNumber}</strong>
        <p>{quote.contact?.company || quote.contact?.email || 'Quote record'}</p>
      </div>
      <div className="inline-actions">
        <b>{quote.status || 'draft'}</b>
        <span>${Number(quote.total || 0).toLocaleString()}</span>
        <button
          type="button"
          className="ghost-button compact-button"
          onClick={() => navigateToRoute('quotes', { selected: quote.id })}
        >
          Open
        </button>
      </div>
    </div>
  )

  const renderContractRow = (contract: ContractRecord) => (
    <div className="table-row stacked-row" key={contract.id}>
      <div>
        <strong>{contract.title}</strong>
        <p>{contract.contractNumber}</p>
      </div>
      <div className="inline-actions">
        <b>{contract.status || 'draft'}</b>
        <span>{formatDate(contract.endDate)}</span>
        <button
          type="button"
          className="ghost-button compact-button"
          onClick={() => navigateToRoute('contracts', { selected: contract.id })}
        >
          Open
        </button>
      </div>
    </div>
  )

  const renderTaskRow = (task: TaskRecord) => (
    <div className="table-row stacked-row" key={task.id}>
      <div>
        <strong>{task.title}</strong>
        <p>{task.description || 'Task record'}</p>
      </div>
      <div className="inline-actions">
        <b>{task.status || 'todo'}</b>
        <span>{task.priority || 'medium'}</span>
        <button
          type="button"
          className="ghost-button compact-button"
          onClick={() => navigateToRoute('tasks', { selected: task.id })}
        >
          Open
        </button>
      </div>
    </div>
  )

  return (
    <section className="page-grid page-grid-wide">
      <div className="main-column">
        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Find anything</p>
              <h3>Global CRM search</h3>
            </div>
            <span className="pill neutral">
              {totalResults ? `${totalResults} matches` : `Search ${labels.contactPlural.toLowerCase()}, deals, and work`}
            </span>
          </div>

          <div className="search-command-grid">
            <label className="field field-span-2">
              <span>Search query</span>
              <input
                type="search"
                placeholder={`Try a ${labels.contactSingular.toLowerCase()} name, quote number, company, or task title`}
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Scope</span>
              <select value={entity} onChange={(event) => setEntity(event.target.value as SearchEntity)}>
                {entityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="search-command-actions">
              <button type="button" className="primary-button" onClick={submitSearch}>
                Run search
              </button>
            </div>
          </div>

          <div className="save-search-row">
            <label className="field">
              <span>Save current search</span>
              <input
                placeholder="Renewals at risk"
                value={saveName}
                onChange={(event) => setSaveName(event.target.value)}
              />
            </label>
            <button type="button" className="ghost-button" onClick={saveCurrentSearch}>
              Save view
            </button>
          </div>

          {saveError ? <p className="auth-error">{saveError}</p> : null}
          <LoadState loading={loading} error={error} title="Searching the workspace" />
        </article>

        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Results</p>
              <h3>Live search results</h3>
            </div>
          </div>

          {!q.trim() && !advancedContacts && !advancedLeads ? (
            <div className="empty-card">
              {`Start with a ${labels.contactSingular.toLowerCase()} name, account, quote number, contract number, or task title.`}
            </div>
          ) : null}

          {advancedContacts ? (
            <div className="table-list">{advancedContacts.map(renderContactRow)}</div>
          ) : null}

          {advancedLeads ? <div className="table-list">{advancedLeads.map(renderLeadRow)}</div> : null}

          {!advancedContacts && !advancedLeads ? (
            <div className="search-results-grid">
              <article className="result-group">
                <header>
                  <strong>{labels.contactPlural}</strong>
                  <span>{results?.contacts?.length || 0}</span>
                </header>
                <div className="table-list compact-list">
                  {(results?.contacts || []).map(renderContactRow)}
                </div>
              </article>

              <article className="result-group">
                <header>
                  <strong>Leads</strong>
                  <span>{results?.leads?.length || 0}</span>
                </header>
                <div className="table-list compact-list">
                  {(results?.leads || []).map(renderLeadRow)}
                </div>
              </article>

              <article className="result-group">
                <header>
                  <strong>Quotes</strong>
                  <span>{results?.quotes?.length || 0}</span>
                </header>
                <div className="table-list compact-list">
                  {(results?.quotes || []).map(renderQuoteRow)}
                </div>
              </article>

              <article className="result-group">
                <header>
                  <strong>Contracts</strong>
                  <span>{results?.contracts?.length || 0}</span>
                </header>
                <div className="table-list compact-list">
                  {(results?.contracts || []).map(renderContractRow)}
                </div>
              </article>

              <article className="result-group">
                <header>
                  <strong>Tasks</strong>
                  <span>{results?.tasks?.length || 0}</span>
                </header>
                <div className="table-list compact-list">
                  {(results?.tasks || []).map(renderTaskRow)}
                </div>
              </article>
            </div>
          ) : null}
        </article>
      </div>

      <div className="side-column">
        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Saved views</p>
              <h3>Reusable searches</h3>
            </div>
          </div>

          <div className="table-list">
            {savedSearches.length ? (
              savedSearches.map((search) => (
                <div className="table-row stacked-row" key={search.id}>
                  <div>
                    <strong>{search.name}</strong>
                    <p>{search.entityType}</p>
                  </div>
                  <div className="inline-actions">
                    <button type="button" className="ghost-button compact-button" onClick={() => runSavedSearch(search)}>
                      Open
                    </button>
                    <button type="button" className="ghost-button compact-button" onClick={() => deleteSavedSearch(search.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-card">Save common search views for your team here.</div>
            )}
          </div>
        </article>

        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Advanced filters</p>
              <h3>Precision search</h3>
            </div>
          </div>

          <div className="detail-stack">
            <div className="detail-note">
              <span className="data-label">{labels.contactPlural}</span>
              <div className="form-grid">
                <label className="field">
                  <span>Keyword</span>
                  <input
                    value={contactFilters.q}
                    onChange={(event) => setContactFilters((current) => ({ ...current, q: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Status</span>
                  <select
                    value={contactFilters.status}
                    onChange={(event) => setContactFilters((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option value="">Any</option>
                    <option value="active">Active</option>
                    <option value="prospect">Prospect</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label className="field field-span-2">
                  <span>Company</span>
                  <input
                    value={contactFilters.company}
                    onChange={(event) => setContactFilters((current) => ({ ...current, company: event.target.value }))}
                  />
                </label>
              </div>
              <button type="button" className="primary-button compact-button" onClick={runAdvancedContactSearch}>
                {`Search ${labels.contactPlural.toLowerCase()}`}
              </button>
            </div>

            <div className="detail-note">
              <span className="data-label">Leads</span>
              <div className="form-grid">
                <label className="field">
                  <span>Keyword</span>
                  <input
                    value={leadFilters.q}
                    onChange={(event) => setLeadFilters((current) => ({ ...current, q: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Stage</span>
                  <select
                    value={leadFilters.stage}
                    onChange={(event) => setLeadFilters((current) => ({ ...current, stage: event.target.value }))}
                  >
                    <option value="">Any</option>
                    {pipelineStages.map((stage: { key: string; label: string }) => (
                      <option key={stage.key} value={stage.key}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field field-span-2">
                  <span>Source</span>
                  <input
                    value={leadFilters.source}
                    onChange={(event) => setLeadFilters((current) => ({ ...current, source: event.target.value }))}
                  />
                </label>
              </div>
              <button type="button" className="primary-button compact-button" onClick={runAdvancedLeadSearch}>
                Search leads
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
