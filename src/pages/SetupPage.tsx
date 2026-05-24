import { useState } from 'react'
import { useAppearance } from '../hooks/useAppearance'
import { useFeedback } from '../hooks/useFeedback'
import { useWorkspaceTemplate } from '../hooks/useWorkspaceTemplate'
import { navigateToRoute } from '../lib/navigation'

export function SetupPage() {
  const {
    applyStarterPack,
    recommendedAppearance,
    settings,
  } = useWorkspaceTemplate()
  const { setTheme, setTileSize } = useAppearance()
  const { notifyError, notifySuccess } = useFeedback()
  const [isInstallingPack, setIsInstallingPack] = useState(false)

  const { labels, starterPack } = settings.runtime

  const applyRecommendedAppearance = () => {
    setTheme(recommendedAppearance.recommendedTheme as any)
    setTileSize(recommendedAppearance.recommendedTileSize as any)
    notifySuccess(
      'Appearance updated',
      `Applied the ${recommendedAppearance.recommendedTheme} theme and ${recommendedAppearance.recommendedTileSize} tile size.`,
    )
  }

  const installStarterPack = async () => {
    setIsInstallingPack(true)

    try {
      const result = await applyStarterPack()
      if (!result) {
        return
      }

      notifySuccess(
        `Installed ${result.createdTemplates} starter templates.`,
        result.skippedTemplates
          ? `${result.skippedTemplates} starter templates were already in the library.`
          : 'Your email starter pack is ready to use.',
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not install the starter pack'
      notifyError(message, 'Starter pack install failed')
    } finally {
      setIsInstallingPack(false)
    }
  }

  return (
    <section className="page-grid page-grid-wide">
      <div className="main-column">
        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Onboarding</p>
              <h3>{`${settings.runtime.industryLabel} workspace setup`}</h3>
            </div>
            <span className="pill cool">{settings.workspaceName}</span>
          </div>

          <div className="detail-stack">
            <div className="detail-note">
              <span className="data-label">Template direction</span>
              <p>{settings.runtime.description}</p>
            </div>

            <div className="inline-actions">
              <button type="button" className="primary-button" onClick={applyRecommendedAppearance}>
                Apply recommended appearance
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={installStarterPack}
                disabled={isInstallingPack}
              >
                {isInstallingPack ? 'Installing starter pack…' : 'Install starter pack'}
              </button>
            </div>
          </div>
        </article>

        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Quick start</p>
              <h3>Launch checklist</h3>
            </div>
          </div>

          <div className="checklist">
            {starterPack.quickStartChecklist.map((item) => (
              <label className="check-row" key={item}>
                <input type="checkbox" readOnly />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className="context-link-row">
            <button type="button" className="ghost-button compact-button" onClick={() => navigateToRoute('contacts')}>
              Open {labels.contactPlural}
            </button>
            <button type="button" className="ghost-button compact-button" onClick={() => navigateToRoute('pipeline')}>
              Open {labels.pipelinePlural}
            </button>
            <button type="button" className="ghost-button compact-button" onClick={() => navigateToRoute('email')}>
              Open Email
            </button>
          </div>
        </article>

        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Preset packs</p>
              <h3>Workflow defaults for this industry</h3>
            </div>
          </div>

          <div className="operations-grid">
            <article className="ops-card">
              <div className="ops-topline">
                <span>◧</span>
                <strong>Lead sources</strong>
              </div>
              <b>{starterPack.leadSources.length}</b>
              <p>{starterPack.leadSources.join(', ')}</p>
            </article>

            <article className="ops-card">
              <div className="ops-topline">
                <span>▣</span>
                <strong>Task categories</strong>
              </div>
              <b>{starterPack.taskCategories.length}</b>
              <p>{starterPack.taskCategories.join(', ')}</p>
            </article>

            <article className="ops-card">
              <div className="ops-topline">
                <span>◩</span>
                <strong>{labels.onboardingPlural}</strong>
              </div>
              <b>{starterPack.onboardingSteps.length} steps</b>
              <p>{starterPack.onboardingSteps.join(', ')}</p>
            </article>
          </div>
        </article>
      </div>

      <div className="side-column">
        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Starter emails</p>
              <h3>Templates ready to install</h3>
            </div>
          </div>

          <div className="table-list compact-list">
            {starterPack.emailTemplates.map((template) => (
              <div className="table-row stacked-row" key={template.name}>
                <div>
                  <strong>{template.name}</strong>
                  <p>{template.description}</p>
                </div>
                <div className="row-meta">
                  <b>{template.templateType}</b>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Document defaults</p>
              <h3>Sales and finance copy</h3>
            </div>
          </div>

          <div className="detail-stack">
            <div className="detail-note">
              <span className="data-label">Quote intro</span>
              <p>{starterPack.documents.quoteIntro}</p>
            </div>
            <div className="detail-note">
              <span className="data-label">Contract summary</span>
              <p>{starterPack.documents.contractSummary}</p>
            </div>
            <div className="detail-note">
              <span className="data-label">Invoice footer</span>
              <p>{starterPack.documents.invoiceFooter}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
