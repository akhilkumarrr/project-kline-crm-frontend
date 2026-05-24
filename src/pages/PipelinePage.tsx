import { LoadState } from '../components/LoadState'
import { dealForecast, pipelineColumns } from '../data/crm-data'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'

export function PipelinePage() {
  const { token } = useAuth()
  const { data, error, loading } = useApiQuery(
    Boolean(token),
    () => api.getLeads(token!),
    [token],
  )

  const liveLeads = data?.data ?? []
  const groupedColumns = liveLeads.length
    ? Object.entries(
        liveLeads.reduce<Record<string, typeof liveLeads>>((accumulator, lead) => {
          const key = lead.stage || 'unassigned'
          accumulator[key] = accumulator[key] || []
          accumulator[key].push(lead)
          return accumulator
        }, {}),
      ).map(([stage, deals]) => ({
        stage,
        count: deals.length,
        value: `$${deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0).toLocaleString()}`,
        deals: deals.slice(0, 4).map((deal) => ({
          name: deal.title,
          owner: deal.owner?.firstName || 'Owner',
          summary: deal.description || 'Lead in progress',
          amount: `$${Number(deal.value || 0).toLocaleString()}`,
          nextStep: deal.source || 'Follow up',
        })),
      }))
    : pipelineColumns

  return (
    <section className="page-grid">
      <div className="main-column">
        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Sales workflow</p>
              <h3>Pipeline board</h3>
            </div>
            <span className="pill warm">
              {data?.total ? `${data.total} live opportunities` : 'Live opportunities'}
            </span>
          </div>

          <LoadState loading={loading} error={error} title="Loading pipeline" />

          <div className="pipeline-board">
            {groupedColumns.map((column) => (
              <section className="pipeline-column" key={column.stage}>
                <header>
                  <div>
                    <strong>{column.stage}</strong>
                    <span>{column.count} deals</span>
                  </div>
                  <b>{column.value}</b>
                </header>
                <div className="deal-stack">
                  {column.deals.map((deal) => (
                    <article className="deal-card" key={deal.name}>
                      <div className="deal-row">
                        <strong>{deal.name}</strong>
                        <span>{deal.owner}</span>
                      </div>
                      <p>{deal.summary}</p>
                      <div className="deal-row">
                        <b>{deal.amount}</b>
                        <span>{deal.nextStep}</span>
                      </div>
                    </article>
                  ))}
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
              <p className="eyebrow">Forecast</p>
              <h3>Close plan</h3>
            </div>
          </div>
          <div className="table-list compact-list">
            {(data?.data?.length ? groupedColumns : dealForecast).map((item: any) => (
              <div className="table-row stacked-row" key={item.label || item.stage}>
                <div>
                  <strong>{item.label || item.stage}</strong>
                  <p>{item.detail || `${item.count} deals in this stage`}</p>
                </div>
                <b>{item.value}</b>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
