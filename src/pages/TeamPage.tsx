import { LoadState } from '../components/LoadState'
import { settingsGroups, teamMembers } from '../data/crm-data'
import { useAppearance } from '../hooks/useAppearance'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'

type TeamPageProps = {
  activeView: string
}

export function TeamPage({ activeView }: TeamPageProps) {
  const isSettings = activeView === 'settings'
  const { token } = useAuth()
  const { setTheme, setTileSize, theme, themeOptions, tileSize, tileSizeOptions } = useAppearance()
  const { data, error, loading } = useApiQuery(
    Boolean(token) && !isSettings,
    async () => {
      const [users, teams] = await Promise.all([
        api.getUsers(token!),
        api.getTeams(token!),
      ])

      return { teams, users }
    },
    [token, isSettings],
  )

  const liveMembers =
    data?.users?.data?.length
      ? data.users.data.map((member: any) => ({
          name: `${member.firstName} ${member.lastName}`.trim(),
          team:
            data.teams?.find((team: any) => team.id === member.teamId)?.name ||
            member.team?.name ||
            'Unassigned',
          role: member.role,
          manager: member.team?.manager?.firstName || 'Team lead',
          load: member.status,
          status: member.status,
          tone: member.status === 'active' ? 'healthy' : 'watching',
        }))
      : teamMembers

  return (
    <section className="page-grid">
      <div className="main-column">
        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{isSettings ? 'Configuration' : 'People ops'}</p>
              <h3>{isSettings ? 'Workspace settings' : 'Users, roles, and teams'}</h3>
            </div>
            <span className="pill cool">{isSettings ? '8 admin areas' : '12 active users'}</span>
          </div>

          {isSettings ? (
            <div className="settings-stack">
              <section className="settings-panel">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">Appearance</p>
                    <h3>Theme and tile sizing</h3>
                  </div>
                  <span className="pill neutral">Saved for this browser</span>
                </div>

                <div className="appearance-grid">
                  <label className="field">
                    <span>Color theme</span>
                    <select value={theme} onChange={(event) => setTheme(event.target.value as any)}>
                      {themeOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Tile size</span>
                    <select value={tileSize} onChange={(event) => setTileSize(event.target.value as any)}>
                      {tileSizeOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="table-list compact-list">
                  {themeOptions.map((option) => (
                    <div className="table-row stacked-row" key={option.id}>
                      <div>
                        <strong>{option.label}</strong>
                        <p>{option.description}</p>
                      </div>
                      <span className={option.id === theme ? 'status-chip healthy' : 'status-chip watching'}>
                        {option.id === theme ? 'Active' : 'Available'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="table-list compact-list">
                  {tileSizeOptions.map((option) => (
                    <div className="table-row stacked-row" key={option.id}>
                      <div>
                        <strong>{option.label}</strong>
                        <p>{option.description}</p>
                      </div>
                      <span className={option.id === tileSize ? 'status-chip healthy' : 'status-chip neutral-chip'}>
                        {option.id === tileSize ? 'Selected' : 'Preset'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="appearance-preview">
                  <article className="preview-card preview-card-accent">
                    <span>Dashboard tile</span>
                    <strong>$214K</strong>
                    <p>Revenue card preview responds to tile size and theme tokens.</p>
                  </article>
                  <article className="preview-card">
                    <span>Pipeline tile</span>
                    <strong>Archer Legal</strong>
                    <p>Selected states, pills, and spacing all scale from the same variables.</p>
                  </article>
                  <article className="preview-card preview-card-dark">
                    <span>Operations tile</span>
                    <strong>Schedule board</strong>
                    <p>Dark boards keep their character while still inheriting palette decisions.</p>
                  </article>
                </div>
              </section>

              <section className="settings-panel">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">Workspace settings</p>
                    <h3>Admin areas and configuration</h3>
                  </div>
                </div>

                <div className="table-list">
                  {settingsGroups.map((group) => (
                    <div className="table-row stacked-row" key={group.title}>
                      <div>
                        <strong>{group.title}</strong>
                        <p>{group.detail}</p>
                      </div>
                      <b>{group.meta}</b>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <>
              <LoadState loading={loading} error={error} title="Loading users and teams" />
              <div className="table-list">
                {liveMembers.map((member) => (
                  <div className="table-row contact-row" key={member.name}>
                    <div>
                      <strong>{member.name}</strong>
                      <p>{member.team}</p>
                    </div>
                    <div>
                      <span className="data-label">Role</span>
                      <b>{member.role}</b>
                    </div>
                    <div>
                      <span className="data-label">Manager</span>
                      <b>{member.manager}</b>
                    </div>
                    <div>
                      <span className="data-label">Load</span>
                      <b>{member.load}</b>
                    </div>
                    <div>
                      <span className={`status-chip ${member.tone}`}>{member.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  )
}
