import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  api,
  type WorkspaceSettingsPayload,
  type WorkspaceSettingsRecord,
  type WorkspaceStarterPackResult,
} from '../lib/api'
import { useAuth } from './useAuth'

type WorkspaceTemplateContextValue = {
  applyStarterPack: () => Promise<WorkspaceStarterPackResult | null>
  error: string | null
  isLoading: boolean
  labels: WorkspaceSettingsRecord['runtime']['labels']
  pipelineStages: WorkspaceSettingsRecord['runtime']['pipeline']['stages']
  recommendedAppearance: WorkspaceSettingsRecord['runtime']['theme']
  settings: WorkspaceSettingsRecord
  updateSettings: (payload: WorkspaceSettingsPayload) => Promise<WorkspaceSettingsRecord>
  viewLabels: Record<string, string>
}

const fallbackSettings: WorkspaceSettingsRecord = {
  availableTemplates: [
    {
      description:
        'Built for client-service teams managing pipeline, delivery, and recurring retainers.',
      industryLabel: 'Agency',
      key: 'agency',
    },
    {
      description:
        'Designed for advisory, coaching, and consulting firms with milestone-heavy sales cycles.',
      industryLabel: 'Consulting',
      key: 'consulting',
    },
    {
      description:
        'Tailored for photographers coordinating inquiries, bookings, shoots, delivery, and payment follow-up.',
      industryLabel: 'Photography',
      key: 'photography',
    },
  ],
  baseRuntime: {
    dashboard: {
      focusLabel: 'Agency command center',
      heroDescription:
        'Keep proposals, onboarding, support, and recurring revenue moving in one place.',
      heroTitle: 'Run client growth, delivery, and retention from one modern workspace.',
      metrics: {
        openTicketsLabel: 'Open tickets',
        pipelineValueLabel: 'Pipeline value',
        tasksDueTodayLabel: 'Tasks due today',
      },
      spotlightLabel: 'Client health',
    },
    description:
      'Built for client-service teams managing pipeline, delivery, and recurring retainers.',
    industryLabel: 'Agency',
    key: 'agency',
    labels: {
      appointmentPlural: 'Appointments',
      appointmentSingular: 'Appointment',
      contactPlural: 'Contacts',
      contactSingular: 'Contact',
      onboardingPlural: 'Onboarding',
      onboardingSingular: 'Onboarding workflow',
      pipelinePlural: 'Pipeline',
      ticketPlural: 'Support',
      ticketSingular: 'Support ticket',
    },
    pipeline: {
      boardLabel: 'Business development pipeline',
      stages: [
        { key: 'new', label: 'New lead' },
        { key: 'contacted', label: 'Discovery' },
        { key: 'qualified', label: 'Qualified' },
        { key: 'proposal', label: 'Proposal' },
        { key: 'negotiation', label: 'Negotiation' },
        { key: 'closed_won', label: 'Active retainer' },
        { key: 'closed_lost', label: 'Closed lost' },
      ],
    },
    starterPack: {
      documents: {
        contractSummary: 'Capture retainers, approval milestones, and service scope in plain language.',
        invoiceFooter:
          'Thank you for partnering with North Star Advisory. Questions? Reply to this invoice email anytime.',
        quoteIntro:
          'This proposal outlines the scope, timeline, and investment for your next growth engagement.',
      },
      emailTemplates: [
        {
          body: 'Hi {{contact_name}},\n\nThanks for reaching out. Here is a quick summary of how we help agencies improve delivery, retention, and recurring growth. I would love to map the right next step with you.\n\nBest,\n{{sender_name}}',
          description: 'First-touch reply for inbound agency leads.',
          name: 'Agency Inquiry Response',
          subject: 'Great to meet you, {{contact_name}}',
          templateType: 'CUSTOM',
          variables: [],
        },
      ],
      leadSources: ['Website', 'Referral partner', 'Outbound email', 'LinkedIn', 'Existing client upsell'],
      onboardingSteps: ['Kickoff confirmed', 'Stakeholders mapped', 'Access granted', 'Timeline approved', 'First milestone delivered'],
      quickStartChecklist: ['Pick your template', 'Apply recommended appearance', 'Install starter pack', 'Create first contact', 'Create first proposal'],
      taskCategories: ['Discovery', 'Proposal follow-up', 'Delivery', 'Renewal', 'Support escalation'],
    },
    theme: {
      recommendedTheme: 'graphite',
      recommendedTileSize: 'comfortable',
    },
    workspaceName: 'North Star Advisory',
  },
  dashboardOverrides: null,
  id: 'local-fallback',
  labelOverrides: null,
  pipelineOverrides: null,
  starterPackOverrides: null,
  runtime: {
    dashboard: {
      focusLabel: 'Agency command center',
      heroDescription:
        'Keep proposals, onboarding, support, and recurring revenue moving in one place.',
      heroTitle: 'Run client growth, delivery, and retention from one modern workspace.',
      metrics: {
        openTicketsLabel: 'Open tickets',
        pipelineValueLabel: 'Pipeline value',
        tasksDueTodayLabel: 'Tasks due today',
      },
      spotlightLabel: 'Client health',
    },
    description:
      'Built for client-service teams managing pipeline, delivery, and recurring retainers.',
    industryLabel: 'Agency',
    key: 'agency',
    labels: {
      appointmentPlural: 'Appointments',
      appointmentSingular: 'Appointment',
      contactPlural: 'Contacts',
      contactSingular: 'Contact',
      onboardingPlural: 'Onboarding',
      onboardingSingular: 'Onboarding workflow',
      pipelinePlural: 'Pipeline',
      ticketPlural: 'Support',
      ticketSingular: 'Support ticket',
    },
    pipeline: {
      boardLabel: 'Business development pipeline',
      stages: [
        { key: 'new', label: 'New lead' },
        { key: 'contacted', label: 'Discovery' },
        { key: 'qualified', label: 'Qualified' },
        { key: 'proposal', label: 'Proposal' },
        { key: 'negotiation', label: 'Negotiation' },
        { key: 'closed_won', label: 'Active retainer' },
        { key: 'closed_lost', label: 'Closed lost' },
      ],
    },
    starterPack: {
      documents: {
        contractSummary: 'Capture retainers, approval milestones, and service scope in plain language.',
        invoiceFooter: 'Thank you for partnering with North Star Advisory. Questions? Reply to this invoice email anytime.',
        quoteIntro: 'This proposal outlines the scope, timeline, and investment for your next growth engagement.',
      },
      emailTemplates: [
        {
          body: 'Hi {{contact_name}},\n\nThanks for reaching out. Here is a quick summary of how we help agencies improve delivery, retention, and recurring growth. I would love to map the right next step with you.\n\nBest,\n{{sender_name}}',
          description: 'First-touch reply for inbound agency leads.',
          name: 'Agency Inquiry Response',
          subject: 'Great to meet you, {{contact_name}}',
          templateType: 'CUSTOM',
          variables: [],
        },
      ],
      leadSources: ['Website', 'Referral partner', 'Outbound email', 'LinkedIn', 'Existing client upsell'],
      onboardingSteps: ['Kickoff confirmed', 'Stakeholders mapped', 'Access granted', 'Timeline approved', 'First milestone delivered'],
      quickStartChecklist: ['Pick your template', 'Apply recommended appearance', 'Install starter pack', 'Create first contact', 'Create first proposal'],
      taskCategories: ['Discovery', 'Proposal follow-up', 'Delivery', 'Renewal', 'Support escalation'],
    },
    theme: {
      recommendedTheme: 'graphite',
      recommendedTileSize: 'comfortable',
    },
    workspaceName: 'North Star Advisory',
  },
  templateKey: 'agency',
  themeOverrides: null,
  workspaceName: 'North Star Advisory',
}

const WorkspaceTemplateContext = createContext<WorkspaceTemplateContextValue | null>(null)

type WorkspaceTemplateProviderProps = {
  children: ReactNode
}

export function WorkspaceTemplateProvider({ children }: WorkspaceTemplateProviderProps) {
  const { token } = useAuth()
  const [settings, setSettings] = useState<WorkspaceSettingsRecord>(fallbackSettings)
  const [isLoading, setIsLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setSettings(fallbackSettings)
      setError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    api
      .getWorkspaceSettings(token)
      .then((nextSettings) => {
        if (!cancelled) {
          setSettings(nextSettings)
          setError(null)
          setIsLoading(false)
        }
      })
      .catch((settingsError: Error) => {
        if (!cancelled) {
          setSettings(fallbackSettings)
          setError(settingsError.message)
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const updateSettings = async (payload: WorkspaceSettingsPayload) => {
    if (!token) {
      return settings
    }

    const nextSettings = await api.updateWorkspaceSettings(token, payload)
    setSettings(nextSettings)
    setError(null)
    return nextSettings
  }

  const applyStarterPack = async () => {
    if (!token) {
      return null
    }

    return api.applyWorkspaceStarterPack(token)
  }

  const value = useMemo<WorkspaceTemplateContextValue>(() => {
    const labels = settings.runtime.labels

    return {
      error,
      isLoading,
      labels,
      pipelineStages: settings.runtime.pipeline.stages,
      recommendedAppearance: settings.runtime.theme,
      settings,
      applyStarterPack,
      updateSettings,
      viewLabels: {
        calendar: labels.appointmentPlural,
        contacts: labels.contactPlural,
        onboarding: labels.onboardingPlural,
        pipeline: labels.pipelinePlural,
        setup: 'Get Started',
        tickets: labels.ticketPlural,
      },
    }
  }, [applyStarterPack, error, isLoading, settings, updateSettings])

  return (
    <WorkspaceTemplateContext.Provider value={value}>
      {children}
    </WorkspaceTemplateContext.Provider>
  )
}

export function useWorkspaceTemplate() {
  const context = useContext(WorkspaceTemplateContext)

  if (!context) {
    throw new Error('useWorkspaceTemplate must be used inside WorkspaceTemplateProvider')
  }

  return context
}
