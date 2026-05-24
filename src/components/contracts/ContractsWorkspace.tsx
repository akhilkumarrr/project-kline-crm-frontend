import { useEffect, useMemo, useState } from 'react'
import { LoadState } from '../LoadState'
import { ContractEditor, createEmptyContractForm, type ContractFormState } from './ContractEditor'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import {
  api,
  type ContractPayload,
  type ContractRecord,
} from '../../lib/api'

type ContractViewModel = {
  contactLabel: string
  endDate?: string | null
  id: string
  notes?: string | null
  paymentTerms?: string | null
  startDate?: string | null
  status: string
  title: string
  tone: string
  value: number
}

const statusOrder = ['draft', 'active', 'expired', 'terminated']

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`

const formatTitleCase = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Not set'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const buildTone = (status?: string) => {
  switch (status) {
    case 'active':
      return 'healthy'
    case 'expired':
    case 'terminated':
      return 'risk'
    default:
      return 'cool'
  }
}

const mapContract = (contract: ContractRecord): ContractViewModel => ({
  contactLabel:
    `${contract.contact?.firstName || ''} ${contract.contact?.lastName || ''}`.trim() ||
    contract.contact?.company ||
    contract.contact?.email ||
    'Unknown contact',
  endDate: contract.endDate,
  id: contract.id,
  notes: contract.notes,
  paymentTerms: contract.paymentTerms,
  startDate: contract.startDate,
  status: contract.status || 'draft',
  title: contract.title,
  tone: buildTone(contract.status),
  value: Number(contract.value || 0),
})

const toFormState = (contract: ContractRecord): ContractFormState => ({
  title: contract.title || '',
  contractNumber: contract.contractNumber || '',
  contactId: contract.contactId,
  description: contract.description || '',
  startDate: contract.startDate ? String(contract.startDate).slice(0, 10) : '',
  endDate: contract.endDate ? String(contract.endDate).slice(0, 10) : '',
  value: Number(contract.value || 0),
  paymentTerms: contract.paymentTerms || '',
  notes: contract.notes || '',
})

const sanitizeContractPayload = (form: ContractFormState): ContractPayload => ({
  title: form.title.trim(),
  contractNumber: form.contractNumber.trim(),
  contactId: form.contactId,
  description: form.description?.trim() || undefined,
  startDate: form.startDate,
  endDate: form.endDate,
  value: Number(form.value || 0),
  paymentTerms: form.paymentTerms?.trim() || undefined,
  notes: form.notes?.trim() || undefined,
})

export function ContractsWorkspace() {
  const { token } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const contractsQuery = useApiQuery(
    Boolean(token),
    () => api.getContracts(token!, 1, 100),
    [token, refreshKey],
  )
  const contactsQuery = useApiQuery(Boolean(token), () => api.getContacts(token!, 1, 200), [
    token,
    refreshKey,
  ])

  const contracts = contractsQuery.data?.data ?? []
  const contacts = contactsQuery.data?.data ?? []

  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [form, setForm] = useState<ContractFormState>(createEmptyContractForm())
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedContractId && contracts.length) {
      setSelectedContractId(contracts[0].id)
    }
  }, [contracts, selectedContractId])

  const contractViews = contracts.map(mapContract)
  const selectedContract =
    contractViews.find((contract) => contract.id === selectedContractId) ||
    contractViews[0] ||
    null

  const groupedContracts = useMemo(
    () =>
      statusOrder.map((status) => ({
        contracts: contractViews.filter((contract) => contract.status === status),
        status,
      })),
    [contractViews],
  )

  const totalValue = contractViews.reduce((sum, contract) => sum + contract.value, 0)

  const refreshContracts = async () => {
    setRefreshKey((current) => current + 1)
  }

  const openCreate = () => {
    setEditorMode('create')
    setForm(createEmptyContractForm(contacts[0]?.id))
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const openEdit = (contractId: string) => {
    const target = contracts.find((contract) => contract.id === contractId)
    if (!target) {
      return
    }

    setEditorMode('edit')
    setForm(toFormState(target))
    setSaveError(null)
    setIsEditorOpen(true)
  }

  const handleFieldChange = (field: keyof ContractFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'value' ? Number(value || 0) : value,
    }))
  }

  const handleSubmit = async () => {
    if (!token) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const payload = sanitizeContractPayload(form)

      if (editorMode === 'create') {
        const created = await api.createContract(token, payload)
        setSelectedContractId(created.id)
      } else if (selectedContractId) {
        const updated = await api.updateContract(token, selectedContractId, payload)
        setSelectedContractId(updated.id)
      }

      setIsEditorOpen(false)
      await refreshContracts()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save contract.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!token || !selectedContractId) {
      return
    }

    try {
      await api.updateContractStatus(token, selectedContractId, status)
      await refreshContracts()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to update contract status.')
    }
  }

  return (
    <>
      <section className="page-grid page-grid-wide">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Commitment</p>
                <h3>Contracts and renewals</h3>
              </div>
              <div className="inline-actions">
                <span className="pill cool">
                  {contractViews.length ? `${formatCurrency(totalValue)} contracted` : 'No contracts yet'}
                </span>
                <button type="button" className="primary-button" onClick={openCreate}>
                  + New contract
                </button>
              </div>
            </div>

            <LoadState
              loading={contractsQuery.loading || contactsQuery.loading}
              error={contractsQuery.error || contactsQuery.error}
              title="Loading contracts"
            />

            <div className="revenue-board">
              {groupedContracts.map((group) => (
                <section className="revenue-column" key={group.status}>
                  <header className="revenue-column-header">
                    <strong>{formatTitleCase(group.status)}</strong>
                    <span>{group.contracts.length} contracts</span>
                  </header>
                  <div className="revenue-stack">
                    {group.contracts.length ? (
                      group.contracts.map((contract) => (
                        <article
                          className={
                            contract.id === selectedContract?.id
                              ? 'revenue-card selected-revenue-card'
                              : 'revenue-card'
                          }
                          key={contract.id}
                        >
                          <button
                            type="button"
                            className="schedule-button"
                            onClick={() => setSelectedContractId(contract.id)}
                          >
                            <div className="schedule-topline">
                              <span className={`schedule-tag ${contract.tone}`}>
                                {formatTitleCase(contract.status)}
                              </span>
                              <b>{formatCurrency(contract.value)}</b>
                            </div>
                            <strong>{contract.title}</strong>
                            <p>{contract.contactLabel}</p>
                          </button>

                          <button
                            type="button"
                            className="ghost-button compact-button"
                            onClick={() => openEdit(contract.id)}
                          >
                            Edit
                          </button>
                        </article>
                      ))
                    ) : (
                      <div className="empty-card">No contracts in this status.</div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Selected contract</p>
                <h3>{selectedContract?.title || 'Contract detail'}</h3>
              </div>
              {selectedContract ? (
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => openEdit(selectedContract.id)}
                >
                  Edit contract
                </button>
              ) : null}
            </div>

            {selectedContract ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <span className="data-label">Contact</span>
                    <strong>{selectedContract.contactLabel}</strong>
                  </div>
                  <div>
                    <span className="data-label">Value</span>
                    <strong>{formatCurrency(selectedContract.value)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Starts</span>
                    <strong>{formatDate(selectedContract.startDate)}</strong>
                  </div>
                  <div>
                    <span className="data-label">Ends</span>
                    <strong>{formatDate(selectedContract.endDate)}</strong>
                  </div>
                </div>

                <div className="status-action-row">
                  {statusOrder.map((status) => (
                    <button
                      type="button"
                      className={selectedContract.status === status ? 'status-action active' : 'status-action'}
                      key={status}
                      onClick={() => handleStatusChange(status)}
                    >
                      {formatTitleCase(status)}
                    </button>
                  ))}
                </div>

                <div className="detail-note">
                  <span className="data-label">Payment terms</span>
                  <p>{selectedContract.paymentTerms || 'Payment terms not specified yet.'}</p>
                </div>

                <div className="detail-note">
                  <span className="data-label">Notes</span>
                  <p>{selectedContract.notes || 'No contract notes have been added yet.'}</p>
                </div>
              </div>
            ) : (
              <div className="empty-card">Select a contract to see the agreement summary.</div>
            )}
          </article>
        </div>
      </section>

      <ContractEditor
        contacts={contacts}
        form={form}
        isOpen={isEditorOpen}
        isSaving={isSaving}
        mode={editorMode}
        onChange={handleFieldChange}
        onClose={() => setIsEditorOpen(false)}
        onSubmit={handleSubmit}
        saveError={saveError}
      />
    </>
  )
}
