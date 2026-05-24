import type { ReactNode } from 'react'
import { sidebarSections } from '../data/crm-data'
import type { CurrentUser } from '../lib/api'

type AppShellProps = {
  activeLabel: string
  activeView: string
  children: ReactNode
  onNavigate: (view: string) => void
  onLogout: () => void
  user: CurrentUser | null
}

export function AppShell({
  activeLabel,
  activeView,
  children,
  onNavigate,
  onLogout,
  user,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-panel">
          <div className="brand-mark">K</div>
          <div>
            <p className="eyebrow">Project Kline</p>
            <h1>Operations CRM</h1>
          </div>
        </div>

        <div className="workspace-card">
          <p className="eyebrow">Workspace</p>
          <strong>North Star Advisory</strong>
          <span>12 team members across sales, onboarding, and support</span>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {sidebarSections.map((section) => (
            <div className="nav-section" key={section.title}>
              <p className="nav-title">{section.title}</p>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === activeView ? 'nav-item active' : 'nav-item'}
                  onClick={() => onNavigate(item.id)}
                >
                  <span className="nav-glyph" aria-hidden="true">
                    {item.glyph}
                  </span>
                  <span>{item.label}</span>
                  {item.count ? <span className="nav-count">{item.count}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div>
            <p className="eyebrow">Signed in as</p>
            <strong>{user ? `${user.firstName} ${user.lastName}` : 'Workspace user'}</strong>
          </div>
          <div className="sidebar-footer-meta">
            <span>{user?.role ?? 'User'}</span>
            <button type="button" className="mini-link" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Today&apos;s focus</p>
            <h2>{activeLabel}</h2>
          </div>

          <div className="topbar-actions">
            <label className="searchbox">
              <span aria-hidden="true">Search</span>
              <input
                type="search"
                placeholder="Contacts, leads, invoices, tickets"
                aria-label="Search the CRM"
              />
            </label>

            <button type="button" className="ghost-button">
              Export snapshot
            </button>
            <button type="button" className="primary-button">
              + Quick create
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}
