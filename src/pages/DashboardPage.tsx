import {
  alerts,
  contactSpotlight,
  dashboardSnapshot,
  metricCards,
  onboardingChecklist,
  operationsQueue,
  pipelineColumns,
  revenueSeries,
  teamPulse,
  timelineFeed,
  todayCalendar,
} from '../data/crm-data'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export function DashboardPage() {
  return (
    <>
      <section className="hero-grid">
        <article className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Daily cockpit</p>
            <h3>Keep pipeline, onboarding, support, and cash flow in one place.</h3>
            <p>
              A small-business CRM should help the team move faster, not bury
              them in tabs. This layout is built around that idea.
            </p>
          </div>

          <div className="hero-stats">
            <div>
              <span>Pipeline value</span>
              <strong>{formatCurrency(dashboardSnapshot.pipelineValue)}</strong>
            </div>
            <div>
              <span>Tasks due today</span>
              <strong>{dashboardSnapshot.tasksDueToday}</strong>
            </div>
            <div>
              <span>Open tickets</span>
              <strong>{dashboardSnapshot.openTickets}</strong>
            </div>
          </div>
        </article>

        <article className="alert-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Attention queue</p>
              <h3>What needs action now</h3>
            </div>
            <span className="pill warm">3 urgent</span>
          </div>

          <div className="alert-list">
            {alerts.map((alert) => (
              <div className="alert-row" key={alert.title}>
                <span className={`alert-dot ${alert.tone}`} aria-hidden="true" />
                <div>
                  <strong>{alert.title}</strong>
                  <p>{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

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

      <section className="content-grid">
        <div className="main-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Revenue motion</p>
                <h3>Pipeline and forecast</h3>
              </div>
              <span className="pill cool">Forecast confidence 78%</span>
            </div>

            <div className="chart-panel">
              <div className="bar-chart" aria-label="Revenue chart">
                {revenueSeries.map((item) => (
                  <div className="bar-group" key={item.label}>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ height: `${item.value}%` }} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="pipeline-summary">
                {pipelineColumns.map((column) => (
                  <div className="pipeline-strip" key={column.stage}>
                    <div>
                      <strong>{column.stage}</strong>
                      <span>{column.count} deals</span>
                    </div>
                    <b>{column.value}</b>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Pipeline board</p>
                <h3>Deals moving this week</h3>
              </div>
              <span className="pill neutral">Kanban-ready</span>
            </div>

            <div className="pipeline-board">
              {pipelineColumns.map((column) => (
                <section className="pipeline-column" key={column.stage}>
                  <header>
                    <div>
                      <strong>{column.stage}</strong>
                      <span>{column.count} active</span>
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

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Operations hub</p>
                <h3>Appointments, invoices, onboarding, and support</h3>
              </div>
              <span className="pill success">All teams aligned</span>
            </div>

            <div className="operations-grid">
              {operationsQueue.map((item) => (
                <article className="ops-card" key={item.title}>
                  <div className="ops-topline">
                    <span>{item.glyph}</span>
                    <strong>{item.title}</strong>
                  </div>
                  <b>{item.metric}</b>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </article>
        </div>

        <div className="side-column">
          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Calendar</p>
                <h3>Today&apos;s appointments</h3>
              </div>
            </div>
            <div className="agenda-list">
              {todayCalendar.map((item) => (
                <div className="agenda-row" key={`${item.time}-${item.title}`}>
                  <span>{item.time}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Customer view</p>
                <h3>{contactSpotlight.name}</h3>
              </div>
              <span className="pill warm">{contactSpotlight.status}</span>
            </div>

            <div className="spotlight-grid">
              <div>
                <span>Company</span>
                <strong>{contactSpotlight.company}</strong>
              </div>
              <div>
                <span>Health score</span>
                <strong>{contactSpotlight.health}</strong>
              </div>
              <div>
                <span>Open invoice</span>
                <strong>{contactSpotlight.invoice}</strong>
              </div>
              <div>
                <span>Next milestone</span>
                <strong>{contactSpotlight.milestone}</strong>
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Onboarding</p>
                <h3>Launch checklist</h3>
              </div>
            </div>

            <div className="checklist">
              {onboardingChecklist.map((item) => (
                <label className="check-row" key={item.label}>
                  <input type="checkbox" checked={item.done} readOnly />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Team pulse</p>
                <h3>Managers and workload</h3>
              </div>
            </div>
            <div className="pulse-list">
              {teamPulse.map((member) => (
                <div className="pulse-row" key={member.name}>
                  <div>
                    <strong>{member.name}</strong>
                    <p>{member.role}</p>
                  </div>
                  <div>
                    <b>{member.load}</b>
                    <span>{member.focus}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Activity stream</p>
                <h3>Latest team moves</h3>
              </div>
            </div>
            <div className="timeline">
              {timelineFeed.map((item) => (
                <div className="timeline-row" key={`${item.time}-${item.title}`}>
                  <span className={`timeline-dot ${item.tone}`} aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span>{item.time}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
