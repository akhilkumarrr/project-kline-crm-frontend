# Project Kline CRM Frontend

Modern React + TypeScript frontend for the Project Kline small-business CRM.

## What Is Included

- Modern CRM shell with sidebar navigation and top search/actions
- Dashboard, contacts, pipeline, operations, analytics, team, and settings views
- Login gate wired to the NestJS backend
- Deep-linkable CRM records across contacts, leads, tasks, quotes, contracts, invoices, and tickets
- Theme presets, tile sizing controls, toasts, confirm dialogs, and crash recovery UI
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

The Vite dev server proxies `/api/*` to `http://localhost:3000`, so the frontend works out of the box with the Nest backend running locally.

## Build

```bash
npm run build
```

## Backend Connection

The frontend defaults to:

```bash
/api/v1
```

You can override that with an environment file or shell variable:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Current Status

This version now includes:

- authenticated multi-screen CRM shell
- connected record navigation across the core modules
- live CRUD workflows for the main business entities
- theme-ready UI controls and reusable product feedback patterns
- safer production behavior through a top-level error boundary
