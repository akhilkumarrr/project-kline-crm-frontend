# Industry Template Architecture

## Goal

Allow the CRM to feel tailored to different industries without forking the codebase. A business should be able to choose a template such as:

- Photography
- Agency
- Consulting
- Real Estate
- Coaching
- Legal
- Accounting
- IT Services

## What A Template Should Control

### Visual theme

- color palette
- accent style
- card density defaults
- icon direction

### Business terminology

- `Contact` -> `Client`
- `Appointment` -> `Session`
- `Onboarding Workflow` -> `Project Setup`

### Dashboard layout

- KPI cards
- workspace widgets
- quick actions

### Pipeline stages

- industry-specific stage sets
- default probabilities
- labels and status colors

### Workflow packs

- onboarding steps
- task checklists
- appointment types
- ticket categories
- email templates
- quote/contract defaults

## Recommended Product Model

Use a built-in template plus workspace overrides.

### Base template

Shipped with the app:

- `agency`
- `consulting`
- `photography`

### Workspace overrides

Stored per business/workspace:

- custom labels
- custom stages
- custom widgets
- custom theme tweaks

Final runtime behavior:

1. load base industry template
2. apply workspace overrides
3. render merged config

## Backend Shape

Recommended entities:

- `WorkspaceSettings`
- `IndustryTemplate`
- `DashboardTemplate`
- `PipelineTemplate`
- `TemplatePack`

Recommended config fields:

- `templateKey`
- `industryType`
- `themeConfig`
- `labelConfig`
- `dashboardConfig`
- `pipelineConfig`
- `workflowConfig`
- `documentConfig`

## Frontend Shape

Recommended frontend layer:

- `TemplateProvider`
- `useWorkspaceTemplate()`
- `useLabel(termKey)`
- `useDashboardConfig()`
- `usePipelineConfig()`

These should drive:

- page labels
- dashboard cards
- pipeline board setup
- default forms and empty states

## Suggested Rollout

### Phase 1

- 3 built-in templates
- theme config
- label config
- dashboard config
- pipeline config

### Phase 2

- workspace overrides
- custom stage editing
- widget selection
- terminology overrides

### Phase 3

- template cloning
- template marketplace feel
- setup wizard during onboarding

## Best First Templates

### Photography

- Contacts -> Clients
- Appointments -> Sessions
- stages:
  - Inquiry
  - Consultation
  - Proposal Sent
  - Booked
  - Shoot Complete
  - Delivered

### Agency

- stages:
  - Lead
  - Discovery
  - Proposal
  - Contract
  - Active Retainer

### Consulting

- stages:
  - Discovery
  - Proposal
  - Negotiation
  - Signed
  - Active

## Recommendation

Build the template system as configuration, not branching UI code. The current CRM structure is already modular enough to support that approach later without a rewrite.
