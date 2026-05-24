# Project Kline CRM Frontend

Modern React + TypeScript frontend for the Project Kline small-business CRM.

## What Is Included

- Modern CRM shell with sidebar navigation and top search/actions
- Dashboard, contacts, pipeline, operations, analytics, team, and settings views
- Login gate wired to the NestJS backend
- Live API integration for:
  - auth
  - contacts
  - leads / pipeline
  - tasks
  - appointments
  - invoices
  - onboarding workflows
  - tickets
  - analytics
  - users and teams

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Backend Connection

The frontend expects the backend at:

```bash
http://localhost:3000/api/v1
```

You can override that with:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Current Status

This version focuses on:

- strong product shell and modern UI foundation
- authenticated frontend flow
- live data loading for the main CRM modules

Next natural steps:

- create/edit forms
- detail drawers and modals
- better empty states and optimistic updates
- richer analytics visualization
- deeper backend coverage for quotes, contracts, email, and comments
