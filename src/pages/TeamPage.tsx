import { LoadState } from '../components/LoadState'
import { settingsGroups, teamMembers } from '../data/crm-data'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'

type TeamPageProps = {
  activeView: string
}

export function TeamPage({ activeView }: TeamPageProps) {
  const isSettings = activeView === 'settings'
  const { token } = useAuth()
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
