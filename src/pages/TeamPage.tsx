import { useEffect, useState } from 'react'
import { LoadState } from '../components/LoadState'
import { settingsGroups, teamMembers } from '../data/crm-data'
import { useAppearance } from '../hooks/useAppearance'
import { useApiQuery } from '../hooks/useApiQuery'
import { useAuth } from '../hooks/useAuth'
import { useFeedback } from '../hooks/useFeedback'
import { useWorkspaceTemplate } from '../hooks/useWorkspaceTemplate'
import { api } from '../lib/api'

type TeamPageProps = {
  activeView: string
}

const labelFields = [
  { key: 'contactSingular', label: 'Primary contact label', placeholder: 'Client' },
  { key: 'contactPlural', label: 'Primary contacts label', placeholder: 'Clients' },
  { key: 'appointmentSingular', label: 'Appointment label', placeholder: 'Session' },
  { key: 'appointmentPlural', label: 'Appointments label', placeholder: 'Sessions' },
  { key: 'onboardingSingular', label: 'Onboarding label', placeholder: 'Launch plan' },
  { key: 'onboardingPlural', label: 'Onboarding plural', placeholder: 'Launch plans' },
  { key: 'ticketSingular', label: 'Support label', placeholder: 'Client request' },
  { key: 'ticketPlural', label: 'Support plural', placeholder: 'Client requests' },
  { key: 'pipelinePlural', label: 'Pipeline label', placeholder: 'Engagement pipeline' },
] as const

type LabelFieldKey = (typeof labelFields)[number]['key']
type StarterEmailTemplateDraft = {
  body: string
  description: string
  name: string
  subject: string
  templateType: string
}

const toMultilineText = (items: string[]) => items.join('\n')

const fromMultilineText = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  if (toIndex < 0 || toIndex >= items.length) {
    return items
  }

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function TeamPage({ activeView }: TeamPageProps) {
  const isSettings = activeView === 'settings'
  const { token } = useAuth()
  const { notifyError, notifySuccess } = useFeedback()
  const {
    applyStarterPack,
    error: templateError,
    isLoading: templateLoading,
    settings,
    updateSettings,
  } = useWorkspaceTemplate()
  const { setTheme, setTileSize, theme, themeOptions, tileSize, tileSizeOptions } = useAppearance()
  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName)
  const [templateKey, setTemplateKey] = useState(settings.templateKey)
  const [labelOverrides, setLabelOverrides] = useState<Record<string, string>>(settings.labelOverrides ?? {})
  const [pipelineBoardLabel, setPipelineBoardLabel] = useState(settings.runtime.pipeline.boardLabel)
  const [pipelineStages, setPipelineStages] = useState(
    settings.runtime.pipeline.stages.map((stage) => ({ ...stage })),
  )
  const [dashboardDraft, setDashboardDraft] = useState({
    focusLabel: settings.runtime.dashboard.focusLabel,
    heroDescription: settings.runtime.dashboard.heroDescription,
    heroTitle: settings.runtime.dashboard.heroTitle,
    openTicketsLabel: settings.runtime.dashboard.metrics.openTicketsLabel,
    pipelineValueLabel: settings.runtime.dashboard.metrics.pipelineValueLabel,
    spotlightLabel: settings.runtime.dashboard.spotlightLabel,
    tasksDueTodayLabel: settings.runtime.dashboard.metrics.tasksDueTodayLabel,
  })
  const [starterDocuments, setStarterDocuments] = useState({
    contractSummary: settings.runtime.starterPack.documents.contractSummary,
    invoiceFooter: settings.runtime.starterPack.documents.invoiceFooter,
    quoteIntro: settings.runtime.starterPack.documents.quoteIntro,
  })
  const [starterLists, setStarterLists] = useState({
    leadSources: toMultilineText(settings.runtime.starterPack.leadSources),
    onboardingSteps: toMultilineText(settings.runtime.starterPack.onboardingSteps),
    quickStartChecklist: toMultilineText(settings.runtime.starterPack.quickStartChecklist),
    taskCategories: toMultilineText(settings.runtime.starterPack.taskCategories),
  })
  const [starterEmailTemplates, setStarterEmailTemplates] = useState<StarterEmailTemplateDraft[]>(
    settings.runtime.starterPack.emailTemplates.map((template) => ({
      body: template.body,
      description: template.description,
      name: template.name,
      subject: template.subject,
      templateType: template.templateType,
    })),
  )
  const [isSavingWorkspaceSettings, setIsSavingWorkspaceSettings] = useState(false)
  const [isInstallingStarterPack, setIsInstallingStarterPack] = useState(false)
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

  useEffect(() => {
    setWorkspaceName(settings.workspaceName)
    setTemplateKey(settings.templateKey)
    setLabelOverrides(settings.labelOverrides ?? {})
    setPipelineBoardLabel(settings.runtime.pipeline.boardLabel)
    setPipelineStages(settings.runtime.pipeline.stages.map((stage) => ({ ...stage })))
    setDashboardDraft({
      focusLabel: settings.runtime.dashboard.focusLabel,
      heroDescription: settings.runtime.dashboard.heroDescription,
      heroTitle: settings.runtime.dashboard.heroTitle,
      openTicketsLabel: settings.runtime.dashboard.metrics.openTicketsLabel,
      pipelineValueLabel: settings.runtime.dashboard.metrics.pipelineValueLabel,
      spotlightLabel: settings.runtime.dashboard.spotlightLabel,
      tasksDueTodayLabel: settings.runtime.dashboard.metrics.tasksDueTodayLabel,
    })
    setStarterDocuments({
      contractSummary: settings.runtime.starterPack.documents.contractSummary,
      invoiceFooter: settings.runtime.starterPack.documents.invoiceFooter,
      quoteIntro: settings.runtime.starterPack.documents.quoteIntro,
    })
    setStarterLists({
      leadSources: toMultilineText(settings.runtime.starterPack.leadSources),
      onboardingSteps: toMultilineText(settings.runtime.starterPack.onboardingSteps),
      quickStartChecklist: toMultilineText(settings.runtime.starterPack.quickStartChecklist),
      taskCategories: toMultilineText(settings.runtime.starterPack.taskCategories),
    })
    setStarterEmailTemplates(
      settings.runtime.starterPack.emailTemplates.map((template) => ({
        body: template.body,
        description: template.description,
        name: template.name,
        subject: template.subject,
        templateType: template.templateType,
      })),
    )
  }, [settings])

  const handleLabelOverrideChange = (key: LabelFieldKey, value: string) => {
    setLabelOverrides((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handlePipelineStageChange = (stageKey: string, value: string) => {
    setPipelineStages((current) =>
      current.map((stage) => (stage.key === stageKey ? { ...stage, label: value } : stage)),
    )
  }

  const movePipelineStage = (index: number, direction: -1 | 1) => {
    setPipelineStages((current) => moveItem(current, index, index + direction))
  }

  const handleDashboardChange = (field: keyof typeof dashboardDraft, value: string) => {
    setDashboardDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleStarterDocumentChange = (field: keyof typeof starterDocuments, value: string) => {
    setStarterDocuments((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleStarterListChange = (field: keyof typeof starterLists, value: string) => {
    setStarterLists((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleStarterEmailChange = (
    index: number,
    field: keyof StarterEmailTemplateDraft,
    value: string,
  ) => {
    setStarterEmailTemplates((current) =>
      current.map((template, templateIndex) =>
        templateIndex === index ? { ...template, [field]: value } : template,
      ),
    )
  }

  const resetLabelsToTemplateDefaults = () => {
    setLabelOverrides({})
  }

  const resetPipelineToTemplateDefaults = () => {
    setPipelineBoardLabel(settings.baseRuntime.pipeline.boardLabel)
    setPipelineStages(settings.baseRuntime.pipeline.stages.map((stage) => ({ ...stage })))
  }

  const resetDashboardToTemplateDefaults = () => {
    setDashboardDraft({
      focusLabel: settings.baseRuntime.dashboard.focusLabel,
      heroDescription: settings.baseRuntime.dashboard.heroDescription,
      heroTitle: settings.baseRuntime.dashboard.heroTitle,
      openTicketsLabel: settings.baseRuntime.dashboard.metrics.openTicketsLabel,
      pipelineValueLabel: settings.baseRuntime.dashboard.metrics.pipelineValueLabel,
      spotlightLabel: settings.baseRuntime.dashboard.spotlightLabel,
      tasksDueTodayLabel: settings.baseRuntime.dashboard.metrics.tasksDueTodayLabel,
    })
  }

  const resetStarterPackToTemplateDefaults = () => {
    setStarterDocuments({
      contractSummary: settings.baseRuntime.starterPack.documents.contractSummary,
      invoiceFooter: settings.baseRuntime.starterPack.documents.invoiceFooter,
      quoteIntro: settings.baseRuntime.starterPack.documents.quoteIntro,
    })
    setStarterLists({
      leadSources: toMultilineText(settings.baseRuntime.starterPack.leadSources),
      onboardingSteps: toMultilineText(settings.baseRuntime.starterPack.onboardingSteps),
      quickStartChecklist: toMultilineText(settings.baseRuntime.starterPack.quickStartChecklist),
      taskCategories: toMultilineText(settings.baseRuntime.starterPack.taskCategories),
    })
    setStarterEmailTemplates(
      settings.baseRuntime.starterPack.emailTemplates.map((template) => ({
        body: template.body,
        description: template.description,
        name: template.name,
        subject: template.subject,
        templateType: template.templateType,
      })),
    )
  }

  const handleInstallStarterPack = async () => {
    setIsInstallingStarterPack(true)

    try {
      const result = await applyStarterPack()
      if (!result) {
        return
      }

      notifySuccess(
        `Installed ${result.createdTemplates} starter templates.`,
        result.skippedTemplates
          ? `${result.skippedTemplates} starter templates were already in the library.`
          : 'Your starter email pack is ready.',
      )
    } catch (starterPackFailure) {
      const message =
        starterPackFailure instanceof Error
          ? starterPackFailure.message
          : 'Could not install the starter pack'
      notifyError(message, 'Starter pack install failed')
    } finally {
      setIsInstallingStarterPack(false)
    }
  }

  const handleSaveWorkspaceSettings = async () => {
    setIsSavingWorkspaceSettings(true)

    try {
      const cleanedLabelOverrides = Object.fromEntries(
        Object.entries(labelOverrides).filter(([, value]) => value.trim()),
      )
      const nextStages = pipelineStages.map((stage) => ({
        key: stage.key,
        label: stage.label.trim() || stage.key,
      }))

      const nextSettings = await updateSettings({
        dashboardOverrides: {
          focusLabel: dashboardDraft.focusLabel.trim(),
          heroDescription: dashboardDraft.heroDescription.trim(),
          heroTitle: dashboardDraft.heroTitle.trim(),
          metrics: {
            openTicketsLabel: dashboardDraft.openTicketsLabel.trim(),
            pipelineValueLabel: dashboardDraft.pipelineValueLabel.trim(),
            tasksDueTodayLabel: dashboardDraft.tasksDueTodayLabel.trim(),
          },
          spotlightLabel: dashboardDraft.spotlightLabel.trim(),
        },
        labelOverrides: cleanedLabelOverrides,
        pipelineOverrides: {
          boardLabel: pipelineBoardLabel.trim() || settings.runtime.pipeline.boardLabel,
          stages: nextStages,
        },
        starterPackOverrides: {
          documents: {
            contractSummary: starterDocuments.contractSummary.trim(),
            invoiceFooter: starterDocuments.invoiceFooter.trim(),
            quoteIntro: starterDocuments.quoteIntro.trim(),
          },
          emailTemplates: starterEmailTemplates.map((template) => ({
            body: template.body.trim(),
            description: template.description.trim(),
            name: template.name.trim(),
            subject: template.subject.trim(),
            templateType: template.templateType.trim(),
          })),
          leadSources: fromMultilineText(starterLists.leadSources),
          onboardingSteps: fromMultilineText(starterLists.onboardingSteps),
          quickStartChecklist: fromMultilineText(starterLists.quickStartChecklist),
          taskCategories: fromMultilineText(starterLists.taskCategories),
        },
        templateKey,
        workspaceName: workspaceName.trim() || settings.workspaceName,
      })
      notifySuccess(
        'Workspace template updated',
        `${nextSettings.runtime.industryLabel} configuration applied`,
      )
    } catch (saveFailure) {
      const message =
        saveFailure instanceof Error ? saveFailure.message : 'Could not save workspace template'
      notifyError(message, 'Workspace settings failed')
    } finally {
      setIsSavingWorkspaceSettings(false)
    }
  }

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
                    <p className="eyebrow">Workspace profile</p>
                    <h3>Industry template and workspace name</h3>
                  </div>
                  <span className="pill cool">{settings.runtime.industryLabel}</span>
                </div>

                <LoadState loading={templateLoading} error={templateError} title="Loading workspace template" />

                <div className="appearance-grid">
                  <label className="field">
                    <span>Workspace name</span>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span>Business template</span>
                    <select value={templateKey} onChange={(event) => setTemplateKey(event.target.value)}>
                      {settings.availableTemplates.map((template) => (
                        <option key={template.key} value={template.key}>
                          {template.industryLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="table-list compact-list">
                  {settings.availableTemplates.map((template) => (
                    <div className="table-row stacked-row" key={template.key}>
                      <div>
                        <strong>{template.industryLabel}</strong>
                        <p>{template.description}</p>
                      </div>
                      <span className={template.key === templateKey ? 'status-chip healthy' : 'status-chip neutral-chip'}>
                        {template.key === templateKey ? 'Selected' : 'Available'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="appearance-preview">
                  <article className="preview-card preview-card-accent">
                    <span>Recommended theme</span>
                    <strong>{settings.runtime.theme.recommendedTheme}</strong>
                    <p>Suggested visual preset for this industry template.</p>
                  </article>
                  <article className="preview-card">
                    <span>Recommended density</span>
                    <strong>{settings.runtime.theme.recommendedTileSize}</strong>
                    <p>Suggested tile sizing for the selected workflow style.</p>
                  </article>
                  <article className="preview-card preview-card-dark">
                    <span>Pipeline label</span>
                    <strong>{settings.runtime.labels.pipelinePlural}</strong>
                    <p>{settings.runtime.pipeline.boardLabel}</p>
                  </article>
                </div>

                <div className="inline-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleSaveWorkspaceSettings}
                    disabled={isSavingWorkspaceSettings}
                  >
                    {isSavingWorkspaceSettings ? 'Saving…' : 'Save workspace profile'}
                  </button>
                </div>
              </section>

              <section className="settings-panel">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">Terminology</p>
                    <h3>Rename the workspace around your business language</h3>
                  </div>
                  <div className="inline-actions">
                    <span className="pill neutral">Workspace overrides</span>
                    <button
                      type="button"
                      className="ghost-button compact-button"
                      onClick={resetLabelsToTemplateDefaults}
                    >
                      Restore defaults
                    </button>
                  </div>
                </div>

                <div className="appearance-grid">
                  {labelFields.map((field) => (
                    <label className="field" key={field.key}>
                      <span>{field.label}</span>
                      <input
                        type="text"
                        value={labelOverrides[field.key] ?? ''}
                        placeholder={settings.runtime.labels[field.key]}
                        onChange={(event) => handleLabelOverrideChange(field.key, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="settings-panel">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">Pipeline overrides</p>
                    <h3>Customize board naming and stage labels</h3>
                  </div>
                  <div className="inline-actions">
                    <span className="pill cool">{settings.runtime.pipeline.stages.length} stages</span>
                    <button
                      type="button"
                      className="ghost-button compact-button"
                      onClick={resetPipelineToTemplateDefaults}
                    >
                      Restore defaults
                    </button>
                  </div>
                </div>

                <div className="appearance-grid">
                  <label className="field field-span-2">
                    <span>Pipeline board description</span>
                    <input
                      type="text"
                      value={pipelineBoardLabel}
                      onChange={(event) => setPipelineBoardLabel(event.target.value)}
                    />
                  </label>

                  {pipelineStages.map((stage, index) => (
                    <div className="field field-span-2" key={stage.key}>
                      <span>{stage.key.replace(/_/g, ' ')}</span>
                      <div className="context-link-row">
                        <input
                          type="text"
                          value={stage.label}
                          onChange={(event) => handlePipelineStageChange(stage.key, event.target.value)}
                        />
                        <button
                          type="button"
                          className="ghost-button compact-button"
                          onClick={() => movePipelineStage(index, -1)}
                          disabled={index === 0}
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          className="ghost-button compact-button"
                          onClick={() => movePipelineStage(index, 1)}
                          disabled={index === pipelineStages.length - 1}
                        >
                          Move down
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="settings-panel">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">Dashboard copy</p>
                    <h3>Shape the command center around this industry</h3>
                  </div>
                  <div className="inline-actions">
                    <span className="pill neutral">Template aware</span>
                    <button
                      type="button"
                      className="ghost-button compact-button"
                      onClick={resetDashboardToTemplateDefaults}
                    >
                      Restore defaults
                    </button>
                  </div>
                </div>

                <div className="appearance-grid">
                  <label className="field">
                    <span>Focus label</span>
                    <input
                      type="text"
                      value={dashboardDraft.focusLabel}
                      onChange={(event) => handleDashboardChange('focusLabel', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Spotlight label</span>
                    <input
                      type="text"
                      value={dashboardDraft.spotlightLabel}
                      onChange={(event) => handleDashboardChange('spotlightLabel', event.target.value)}
                    />
                  </label>
                  <label className="field field-span-2">
                    <span>Hero title</span>
                    <input
                      type="text"
                      value={dashboardDraft.heroTitle}
                      onChange={(event) => handleDashboardChange('heroTitle', event.target.value)}
                    />
                  </label>
                  <label className="field field-span-2">
                    <span>Hero description</span>
                    <textarea
                      rows={3}
                      value={dashboardDraft.heroDescription}
                      onChange={(event) => handleDashboardChange('heroDescription', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Pipeline metric label</span>
                    <input
                      type="text"
                      value={dashboardDraft.pipelineValueLabel}
                      onChange={(event) => handleDashboardChange('pipelineValueLabel', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Tasks metric label</span>
                    <input
                      type="text"
                      value={dashboardDraft.tasksDueTodayLabel}
                      onChange={(event) => handleDashboardChange('tasksDueTodayLabel', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Support metric label</span>
                    <input
                      type="text"
                      value={dashboardDraft.openTicketsLabel}
                      onChange={(event) => handleDashboardChange('openTicketsLabel', event.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="settings-panel">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">Starter pack</p>
                    <h3>Document defaults and workflow presets</h3>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="ghost-button compact-button"
                      onClick={resetStarterPackToTemplateDefaults}
                    >
                      Restore defaults
                    </button>
                    <button
                      type="button"
                      className="ghost-button compact-button"
                      onClick={handleInstallStarterPack}
                      disabled={isInstallingStarterPack}
                    >
                      {isInstallingStarterPack ? 'Installing…' : 'Install starter emails'}
                    </button>
                  </div>
                </div>

                <div className="appearance-grid">
                  <label className="field field-span-2">
                    <span>Quote intro</span>
                    <textarea
                      rows={3}
                      value={starterDocuments.quoteIntro}
                      onChange={(event) => handleStarterDocumentChange('quoteIntro', event.target.value)}
                    />
                  </label>
                  <label className="field field-span-2">
                    <span>Contract summary</span>
                    <textarea
                      rows={3}
                      value={starterDocuments.contractSummary}
                      onChange={(event) => handleStarterDocumentChange('contractSummary', event.target.value)}
                    />
                  </label>
                  <label className="field field-span-2">
                    <span>Invoice footer</span>
                    <textarea
                      rows={3}
                      value={starterDocuments.invoiceFooter}
                      onChange={(event) => handleStarterDocumentChange('invoiceFooter', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Lead sources</span>
                    <textarea
                      rows={5}
                      value={starterLists.leadSources}
                      onChange={(event) => handleStarterListChange('leadSources', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Task categories</span>
                    <textarea
                      rows={5}
                      value={starterLists.taskCategories}
                      onChange={(event) => handleStarterListChange('taskCategories', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{settings.runtime.labels.onboardingPlural}</span>
                    <textarea
                      rows={5}
                      value={starterLists.onboardingSteps}
                      onChange={(event) => handleStarterListChange('onboardingSteps', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Quick start checklist</span>
                    <textarea
                      rows={5}
                      value={starterLists.quickStartChecklist}
                      onChange={(event) => handleStarterListChange('quickStartChecklist', event.target.value)}
                    />
                  </label>
                </div>

                <div className="table-list compact-list">
                  {starterEmailTemplates.map((template, index) => (
                    <div className="table-row stacked-row" key={`${template.name}-${index}`}>
                      <div className="detail-stack">
                        <label className="field">
                          <span>Template name</span>
                          <input
                            type="text"
                            value={template.name}
                            onChange={(event) =>
                              handleStarterEmailChange(index, 'name', event.target.value)
                            }
                          />
                        </label>
                        <label className="field">
                          <span>Description</span>
                          <input
                            type="text"
                            value={template.description}
                            onChange={(event) =>
                              handleStarterEmailChange(index, 'description', event.target.value)
                            }
                          />
                        </label>
                        <label className="field">
                          <span>Subject</span>
                          <input
                            type="text"
                            value={template.subject}
                            onChange={(event) =>
                              handleStarterEmailChange(index, 'subject', event.target.value)
                            }
                          />
                        </label>
                        <label className="field">
                          <span>Body</span>
                          <textarea
                            rows={5}
                            value={template.body}
                            onChange={(event) =>
                              handleStarterEmailChange(index, 'body', event.target.value)
                            }
                          />
                        </label>
                      </div>
                      <span className="status-chip neutral-chip">{template.templateType}</span>
                    </div>
                  ))}
                </div>
              </section>

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
