import { LoadState } from '../components/LoadState'
import { analyticsHighlights, metricCards } from '../data/crm-data'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'

export function AnalyticsPage() {
  const { token } = useAuth()
  const { data, error, loading } = useApiQuery(
    Boolean(token),
    async () => {
      const [pipeline, forecast, activity, sources, quoteMetrics] = await Promise.all([
        api.getAnalyticsPipeline(token!),
        api.getAnalyticsForecast(token!),
        api.getAnalyticsActivitySummary(token!),
        api.getAnalyticsLeadSources(token!),
        api.getAnalyticsQuoteMetrics(token!),
      ])

      return { activity, forecast, pipeline, quoteMetrics, sources }
    },
    [token],
  )

  const liveHighlights = data
    ? [
        {
          label: 'Pipeline value',
          detail: `${data.pipeline.totalDeals ?? 0} deals across the active board.`,
          value: `$${Number(data.pipeline.totalValue ?? 0).toLocaleString()}`,
        },
        {
          label: 'Forecast value',
          detail: `${Math.round(Number(data.forecast.weightedAverageProbability ?? 0))}% weighted average probability.`,
          value: `$${Number(data.forecast.forecastValue ?? 0).toLocaleString()}`,
        },
        {
          label: 'Quote metrics',
          detail: `${data.quoteMetrics.acceptedQuotes ?? 0} accepted quotes so far.`,
          value: `${Math.round(Number(data.quoteMetrics.acceptanceRate ?? 0) * 100)}% acceptance`,
        },
        ...(Array.isArray(data.sources)
          ? data.sources.slice(0, 2).map((source: any) => ({
              label: `Source: ${source.source}`,
              detail: `${source.count} leads recorded from this source.`,
              value: `$${Number(source.totalValue ?? 0).toLocaleString()}`,
            }))
          : []),
      ]
    : analyticsHighlights

  return (
    <section className="page-grid page-grid-wide">
      <div className="main-column">
        <section className="metric-grid">
          {metricCards.map((card) => (
            <article className="metric-card" key={card.label}>
              <div className="metric-topline">
                <span>{card.label}</span>
                <span className={`trend ${card.trendTone}`}>{card.trend}</span>
              </div>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </section>

        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Management view</p>
              <h3>Key reporting slices</h3>
            </div>
          </div>

          <LoadState loading={loading} error={error} title="Loading analytics" />

          <div className="table-list">
            {liveHighlights.map((item) => (
              <div className="table-row stacked-row" key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
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
