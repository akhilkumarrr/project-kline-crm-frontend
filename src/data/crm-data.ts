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

export const sidebarSections: SidebarSection[] = [
  {
    title: 'Sales',
    items: [
      { id: 'dashboard', label: 'Dashboard', glyph: '◫' },
      { id: 'contacts', label: 'Contacts', glyph: '◎', count: '482' },
      { id: 'pipeline', label: 'Pipeline', glyph: '◧', count: '26' },
      { id: 'quotes', label: 'Quotes', glyph: '◨', count: '18' },
      { id: 'contracts', label: 'Contracts', glyph: '◰', count: '12' },
      { id: 'tasks', label: 'Tasks', glyph: '▣', count: '14' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'calendar', label: 'Appointments', glyph: '◷' },
      { id: 'invoices', label: 'Invoices', glyph: '◪', count: '7' },
      { id: 'onboarding', label: 'Onboarding', glyph: '◩', count: '5' },
      { id: 'tickets', label: 'Support', glyph: '◬', count: '9' },
    ],
  },
  {
    title: 'Control',
    items: [
      { id: 'search', label: 'Search', glyph: '◫' },
      { id: 'analytics', label: 'Analytics', glyph: '◲' },
      { id: 'email', label: 'Email', glyph: '◴' },
      { id: 'team', label: 'Team', glyph: '◍' },
      { id: 'settings', label: 'Settings', glyph: '◭' },
    ],
  },
]

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
