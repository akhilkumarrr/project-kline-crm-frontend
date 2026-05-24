export type SidebarItem = {
  id: string
  label: string
  glyph: string
  count?: string
}

export type SidebarSection = {
  title: string
  items: SidebarItem[]
}

type SidebarLabelOverrides = Partial<
  Record<'calendar' | 'companies' | 'contacts' | 'onboarding' | 'pipeline' | 'setup' | 'tickets', string>
>

export const getSidebarSections = (labels: SidebarLabelOverrides = {}): SidebarSection[] => [
  {
    title: 'Sales',
    items: [
      { id: 'dashboard', label: 'Dashboard', glyph: '◫' },
      { id: 'contacts', label: labels.contacts || 'Contacts', glyph: '◎', count: '482' },
      { id: 'companies', label: labels.companies || 'Companies', glyph: '◌', count: '64' },
      { id: 'pipeline', label: labels.pipeline || 'Pipeline', glyph: '◧', count: '26' },
      { id: 'quotes', label: 'Quotes', glyph: '◨', count: '18' },
      { id: 'contracts', label: 'Contracts', glyph: '◰', count: '12' },
      { id: 'tasks', label: 'Tasks', glyph: '▣', count: '14' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'calendar', label: labels.calendar || 'Appointments', glyph: '◷' },
      { id: 'invoices', label: 'Invoices', glyph: '◪', count: '7' },
      { id: 'onboarding', label: labels.onboarding || 'Onboarding', glyph: '◩', count: '5' },
      { id: 'tickets', label: labels.tickets || 'Support', glyph: '◬', count: '9' },
    ],
  },
  {
    title: 'Control',
    items: [
      { id: 'setup', label: labels.setup || 'Get Started', glyph: '◵' },
      { id: 'notifications', label: 'Notifications', glyph: '◔', count: '!' },
      { id: 'search', label: 'Search', glyph: '◫' },
      { id: 'analytics', label: 'Analytics', glyph: '◲' },
      { id: 'email', label: 'Email', glyph: '◴' },
      { id: 'team', label: 'Team', glyph: '◍' },
      { id: 'settings', label: 'Settings', glyph: '◭' },
    ],
  },
]

export const sidebarSections: SidebarSection[] = getSidebarSections()

export const alerts = [
  {
    title: 'Two invoices cross due today',
    detail: 'Follow up with Lattice Home and Archer Legal before close.',
    tone: 'warm',
  },
  {
    title: 'Renewal call missed for Bluebird Studio',
    detail: 'Contract expires in 4 days and no owner update has been logged.',
    tone: 'danger',
  },
  {
    title: 'Implementation kickoff ready',
    detail: 'North Ridge moved from won deal to onboarding with all files uploaded.',
    tone: 'cool',
  },
]

export const metricCards = [
  {
    label: 'Quarter revenue',
    value: '$214K',
    trend: '+12.4%',
    trendTone: 'up',
    detail: 'Compared with the previous quarter',
  },
  {
    label: 'Lead to quote',
    value: '38%',
    trend: '+4.1%',
    trendTone: 'up',
    detail: 'Opportunity conversion pace',
  },
  {
    label: 'Avg. days to close',
    value: '19',
    trend: '-2 days',
    trendTone: 'up',
    detail: 'Deals are moving faster this month',
  },
  {
    label: 'Support SLA',
    value: '96%',
    trend: 'Stable',
    trendTone: 'flat',
    detail: 'Tickets answered within target window',
  },
]

export const revenueSeries = [
  { label: 'Jan', value: 42 },
  { label: 'Feb', value: 58 },
  { label: 'Mar', value: 61 },
  { label: 'Apr', value: 67 },
  { label: 'May', value: 79 },
  { label: 'Jun', value: 88 },
]

export type PipelineDeal = {
  name: string
  owner: string
  summary: string
  amount: string
  nextStep: string
}

export type PipelineColumn = {
  stage: string
  count: number
  value: string
  deals: PipelineDeal[]
}

export const pipelineColumns: PipelineColumn[] = [
  {
    stage: 'New leads',
    count: 8,
    value: '$88K',
    deals: [
      {
        name: 'Horizon Tax Group',
        owner: 'Maya',
        summary: 'Inbound demo request from website and referral partner.',
        amount: '$12K',
        nextStep: 'Discovery Thu',
      },
      {
        name: 'Oak & Ember',
        owner: 'Akhil',
        summary: 'Needs calendar sync and onboarding walkthrough.',
        amount: '$8K',
        nextStep: 'Qualify today',
      },
    ],
  },
  {
    stage: 'Proposal',
    count: 11,
    value: '$156K',
    deals: [
      {
        name: 'Archer Legal',
        owner: 'Sara',
        summary: 'Quote revised around multi-seat expansion.',
        amount: '$26K',
        nextStep: 'Review terms',
      },
      {
        name: 'Lattice Home',
        owner: 'Nico',
        summary: 'Waiting on procurement approval and invoice schedule.',
        amount: '$18K',
        nextStep: 'Chase Friday',
      },
    ],
  },
  {
    stage: 'Closing',
    count: 7,
    value: '$242K',
    deals: [
      {
        name: 'North Ridge',
        owner: 'Akhil',
        summary: 'Won deal handed to implementation after kickoff booking.',
        amount: '$49K',
        nextStep: 'Contract signed',
      },
      {
        name: 'Bluebird Studio',
        owner: 'Maya',
        summary: 'Renewal expansion tied to support response improvements.',
        amount: '$33K',
        nextStep: 'Exec check-in',
      },
    ],
  },
]

export const operationsQueue = [
  {
    glyph: '◷',
    title: 'Appointments',
    metric: '11 today',
    detail: 'Demo calls, onboarding kickoffs, and renewal reviews mapped in one queue.',
  },
  {
    glyph: '◪',
    title: 'Invoices',
    metric: '$41K open',
    detail: 'Seven invoices tracked with payment status, due dates, and owner handoff.',
  },
  {
    glyph: '◩',
    title: 'Onboarding',
    metric: '5 active',
    detail: 'Every new customer has a milestone-based launch checklist with clear owners.',
  },
  {
    glyph: '◬',
    title: 'Support tickets',
    metric: '9 open',
    detail: 'Service issues stay visible to sales, account management, and founders.',
  },
]

export const todayCalendar = [
  { time: '09:30', title: 'Renewal strategy with Bluebird Studio', meta: 'Akhil + Maya' },
  { time: '11:00', title: 'Implementation kickoff for North Ridge', meta: 'Onboarding team' },
  { time: '14:00', title: 'Archer Legal proposal review', meta: 'Sales + finance' },
  { time: '16:30', title: 'Weekly support escalation triage', meta: 'Ops and support' },
]

export const contactSpotlight = {
  name: 'Elena Park',
  company: 'North Ridge Consulting',
  status: 'Expansion ready',
  health: '92 / 100',
  invoice: '$12,400 due Jun 4',
  milestone: 'Data import sign-off',
}

export const onboardingChecklist = [
  { label: 'Contract countersigned', done: true },
  { label: 'Kickoff call completed', done: true },
  { label: 'Data import approved', done: false },
  { label: 'Internal owner assigned', done: true },
  { label: 'Invoice schedule confirmed', done: false },
]

export const teamPulse = [
  { name: 'Maya Chen', role: 'Sales Manager', load: '8 deals', focus: '2 at-risk renewals' },
  { name: 'Nico Alvarez', role: 'Operations Lead', load: '5 launches', focus: 'Invoice chases' },
  { name: 'Sara Bell', role: 'Customer Success', load: '9 tickets', focus: 'SLA watch' },
]

export const timelineFeed = [
  {
    time: '12 min ago',
    title: 'Quote approved for Archer Legal',
    detail: 'Finance approved revised payment schedule and annual uplift.',
    tone: 'cool',
  },
  {
    time: '48 min ago',
    title: 'New internal note added to North Ridge',
    detail: 'Implementation requested data mapping before migration starts.',
    tone: 'neutral',
  },
  {
    time: '1 hr ago',
    title: 'Ticket escalated for Bluebird Studio',
    detail: 'Owner tagged support lead after repeat sync failure report.',
    tone: 'danger',
  },
  {
    time: '2 hr ago',
    title: 'Invoice reminder sent to Lattice Home',
    detail: 'Automated reminder triggered after payment passed seven days.',
    tone: 'warm',
  },
]

export const contactRecords = [
  {
    name: 'Elena Park',
    company: 'North Ridge Consulting',
    stage: 'Expansion',
    owner: 'Akhil',
    value: '$4.2K',
    health: 'Healthy',
    healthTone: 'healthy',
  },
  {
    name: 'Rafael Woods',
    company: 'Archer Legal',
    stage: 'Proposal',
    owner: 'Sara',
    value: '$7.1K',
    health: 'Watching',
    healthTone: 'watching',
  },
  {
    name: 'Jenna Fisher',
    company: 'Bluebird Studio',
    stage: 'Renewal',
    owner: 'Maya',
    value: '$3.8K',
    health: 'At risk',
    healthTone: 'risk',
  },
]

export const contactTimeline = [
  {
    time: 'Today',
    title: 'Implementation update shared',
    detail: 'Customer approved launch schedule and data import sequencing.',
    tone: 'cool',
  },
  {
    time: 'Yesterday',
    title: 'Invoice sent',
    detail: 'Finance issued the second milestone invoice for onboarding.',
    tone: 'warm',
  },
  {
    time: 'Mon',
    title: 'Task completed',
    detail: 'Internal owner confirmed migration checklist with the customer.',
    tone: 'neutral',
  },
]

type DashboardVariant = {
  alerts: typeof alerts
  contactSpotlight: typeof contactSpotlight
  metricCards: typeof metricCards
  onboardingChecklist: typeof onboardingChecklist
  operationsQueue: typeof operationsQueue
  todayCalendar: typeof todayCalendar
}

const dashboardVariants: Record<string, DashboardVariant> = {
  agency: {
    alerts,
    contactSpotlight,
    metricCards,
    onboardingChecklist,
    operationsQueue,
    todayCalendar,
  },
  consulting: {
    alerts: [
      {
        title: 'Strategy proposal waiting on stakeholder sign-off',
        detail: 'Jordan Group is blocked until the executive sponsor approves the timeline.',
        tone: 'warm',
      },
      {
        title: 'Two discovery notes still need follow-up',
        detail: 'New opportunities from the workshop list have not been sequenced yet.',
        tone: 'cool',
      },
      {
        title: 'Renewal review due this week',
        detail: 'Blue Summit has a quarterly advisory renewal conversation on Friday.',
        tone: 'danger',
      },
    ],
    contactSpotlight: {
      name: 'Jordan Hale',
      company: 'Blue Summit Advisory',
      status: 'Expansion ready',
      health: '94 / 100',
      invoice: '$8,200 due Jun 6',
      milestone: 'Quarterly strategy review',
    },
    metricCards: [
      {
        label: 'Engagement revenue',
        value: '$241K',
        trend: '+9.8%',
        trendTone: 'up',
        detail: 'Signed and active consulting engagements',
      },
      {
        label: 'Discovery to proposal',
        value: '44%',
        trend: '+5.3%',
        trendTone: 'up',
        detail: 'Qualified advisory pipeline performance',
      },
      {
        label: 'Avg. days to sign',
        value: '23',
        trend: '-3 days',
        trendTone: 'up',
        detail: 'Advisory decisions are speeding up',
      },
      {
        label: 'Client response pace',
        value: '91%',
        trend: 'Stable',
        trendTone: 'flat',
        detail: 'Open requests answered within target window',
      },
    ],
    onboardingChecklist: [
      { label: 'Discovery recap shared', done: true },
      { label: 'Scope and milestones approved', done: true },
      { label: 'Kickoff scheduled', done: false },
      { label: 'Data request sent', done: true },
      { label: 'First milestone delivered', done: false },
    ],
    operationsQueue: [
      {
        glyph: '◷',
        title: 'Sessions',
        metric: '8 this week',
        detail: 'Discovery, advisory checkpoints, and board reviews stay aligned in one calendar.',
      },
      {
        glyph: '◪',
        title: 'Invoices',
        metric: '$33K open',
        detail: 'Retainers and milestone invoices stay tied to active engagements and renewals.',
      },
      {
        glyph: '◩',
        title: 'Launch plans',
        metric: '4 active',
        detail: 'Every signed engagement gets a structured kickoff and milestone checklist.',
      },
      {
        glyph: '◬',
        title: 'Client requests',
        metric: '6 open',
        detail: 'Advisory questions and follow-ups stay visible across account ownership.',
      },
    ],
    todayCalendar: [
      { time: '09:00', title: 'Discovery call with Harper Group', meta: 'Advisory pipeline' },
      { time: '11:30', title: 'Quarterly planning session', meta: 'Blue Summit Advisory' },
      { time: '14:00', title: 'Proposal walk-through', meta: 'Jordan Hale + finance' },
      { time: '16:00', title: 'Renewal success review', meta: 'Customer success' },
    ],
  },
  photography: {
    alerts: [
      {
        title: 'Two shoots need final payment follow-up',
        detail: 'Luna Events and Archer Portraits both cross due this week.',
        tone: 'warm',
      },
      {
        title: 'Gallery delivery still pending',
        detail: 'North Ridge wedding gallery has edits outstanding before delivery.',
        tone: 'danger',
      },
      {
        title: 'Weekend booking just moved to confirmed',
        detail: 'Deposit cleared and the shoot plan is ready to send.',
        tone: 'cool',
      },
    ],
    contactSpotlight: {
      name: 'Ava Morgan',
      company: 'Luna Events',
      status: 'Shoot booked',
      health: '90 / 100',
      invoice: '$2,400 due Jun 2',
      milestone: 'Mood board approval',
    },
    metricCards: [
      {
        label: 'Booked revenue',
        value: '$86K',
        trend: '+14.2%',
        trendTone: 'up',
        detail: 'Confirmed shoots and sessions this quarter',
      },
      {
        label: 'Inquiry to booking',
        value: '31%',
        trend: '+3.9%',
        trendTone: 'up',
        detail: 'Session conversion from active inquiries',
      },
      {
        label: 'Avg. booking window',
        value: '12 days',
        trend: '-1 day',
        trendTone: 'up',
        detail: 'Clients are confirming faster',
      },
      {
        label: 'Delivery turnaround',
        value: '95%',
        trend: 'Stable',
        trendTone: 'flat',
        detail: 'Galleries delivered within target window',
      },
    ],
    onboardingChecklist: [
      { label: 'Contract signed', done: true },
      { label: 'Deposit paid', done: true },
      { label: 'Shoot brief approved', done: false },
      { label: 'Session scheduled', done: true },
      { label: 'Delivery timeline confirmed', done: false },
    ],
    operationsQueue: [
      {
        glyph: '◷',
        title: 'Sessions',
        metric: '6 upcoming',
        detail: 'Shoot days, consults, and reveal meetings are all scheduled from one queue.',
      },
      {
        glyph: '◪',
        title: 'Invoices',
        metric: '$12K open',
        detail: 'Deposits, balances, and delivery payments stay tied to each booked client.',
      },
      {
        glyph: '◩',
        title: 'Shoot plans',
        metric: '3 active',
        detail: 'Each booking keeps deliverables, dates, and prep tasks in one structured plan.',
      },
      {
        glyph: '◬',
        title: 'Client requests',
        metric: '4 open',
        detail: 'Reschedules, gallery questions, and add-on requests stay organized.',
      },
    ],
    todayCalendar: [
      { time: '08:30', title: 'Engagement shoot prep call', meta: 'Ava Morgan' },
      { time: '11:00', title: 'Venue walkthrough', meta: 'Luna Events' },
      { time: '15:00', title: 'Gallery reveal session', meta: 'Archer Portraits' },
      { time: '18:00', title: 'Sunset session booking', meta: 'Weekend calendar' },
    ],
  },
}

export const getDashboardVariant = (templateKey: string) =>
  dashboardVariants[templateKey] ?? dashboardVariants.agency

export const dealForecast = [
  {
    label: 'Weighted pipeline',
    detail: 'Probability-adjusted value across active opportunities.',
    value: '$312K',
  },
  {
    label: 'Best case close',
    detail: 'Deals likely to land inside the next 45 days.',
    value: '$182K',
  },
  {
    label: 'Renewal exposure',
    detail: 'Revenue attached to at-risk contract conversations.',
    value: '$54K',
  },
]

export const taskRows = [
  {
    title: 'Follow up with Archer Legal',
    detail: 'Confirm quote revision and legal review timing.',
    meta: 'Due 3:00 PM',
    status: 'In progress',
    tone: 'watching',
  },
  {
    title: 'Prepare North Ridge onboarding handoff',
    detail: 'Bundle notes, kickoff agenda, and assigned contacts.',
    meta: 'Due 5:00 PM',
    status: 'Ready',
    tone: 'healthy',
  },
]

export const appointmentRows = [
  {
    title: 'Bluebird Studio renewal call',
    detail: 'Discuss upgrade plan and service concerns with the owner.',
    meta: '09:30',
    status: 'Confirmed',
    tone: 'healthy',
  },
  {
    title: 'North Ridge kickoff',
    detail: 'Onboarding team and customer stakeholders aligned on launch plan.',
    meta: '11:00',
    status: 'Prep needed',
    tone: 'watching',
  },
]

export const invoiceRows = [
  {
    title: 'Lattice Home invoice #2081',
    detail: 'Past due by 7 days and needs owner follow-up.',
    meta: '$8,400',
    status: 'Overdue',
    tone: 'risk',
  },
  {
    title: 'North Ridge milestone invoice',
    detail: 'Scheduled after data import sign-off.',
    meta: '$12,400',
    status: 'Pending',
    tone: 'watching',
  },
]

export const onboardingRows = [
  {
    title: 'North Ridge Consulting',
    detail: 'Data migration and workspace setup in progress.',
    meta: '67% complete',
    status: 'On track',
    tone: 'healthy',
  },
  {
    title: 'Oak & Ember',
    detail: 'Waiting on account credentials from the customer.',
    meta: '34% complete',
    status: 'Blocked',
    tone: 'risk',
  },
]

export const ticketRows = [
  {
    title: 'Bluebird Studio sync issue',
    detail: 'Customer reported repeat syncing failures in the shared inbox.',
    meta: 'P1',
    status: 'Escalated',
    tone: 'risk',
  },
  {
    title: 'Archer Legal user access question',
    detail: 'Needs role clarification before new team members are added.',
    meta: 'P3',
    status: 'Waiting',
    tone: 'watching',
  },
]

export const analyticsHighlights = [
  {
    label: 'Lead sources',
    detail: 'Referrals continue to outperform paid campaigns on deal size.',
    value: '42% referral-sourced',
  },
  {
    label: 'Quote conversion',
    detail: 'Proposal-to-close ratio improved after revised quote templates.',
    value: '61%',
  },
  {
    label: 'Activity summary',
    detail: 'Managers logged stronger follow-up cadence across the team.',
    value: '184 actions this week',
  },
]

export const teamMembers = [
  {
    name: 'Akhil Kumar',
    team: 'Leadership',
    role: 'Admin',
    manager: 'Self',
    load: '12 shared accounts',
    status: 'Online',
    tone: 'healthy',
  },
  {
    name: 'Maya Chen',
    team: 'Sales',
    role: 'Manager',
    manager: 'Akhil',
    load: '8 opportunities',
    status: 'In meetings',
    tone: 'watching',
  },
  {
    name: 'Sara Bell',
    team: 'Success',
    role: 'Sales Rep',
    manager: 'Maya',
    load: '9 tickets',
    status: 'Available',
    tone: 'healthy',
  },
]

export const settingsGroups = [
  {
    title: 'Roles and permissions',
    detail: 'Manage admin, manager, rep, and viewer access policies.',
    meta: 'RBAC enabled',
  },
  {
    title: 'Email templates',
    detail: 'Quote, contract, reminder, and onboarding template library.',
    meta: '11 templates',
  },
  {
    title: 'Saved views and imports',
    detail: 'Search presets, exports, and CSV job history.',
    meta: '7 active presets',
  },
]

export const dashboardSnapshot = {
  openTickets: 9,
  pipelineValue: 486000,
  tasksDueToday: 14,
}
