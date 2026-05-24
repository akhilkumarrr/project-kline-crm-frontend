# Project Kline CRM Frontend

Modern React + TypeScript frontend for the Project Kline small-business CRM.

## What Is Included

- Multi-screen CRM shell with dashboard, contacts, pipeline, operations, analytics, team, and settings
- Login flow wired to the NestJS backend
- Cross-linked CRM records across contacts, leads, tasks, quotes, contracts, invoices, and tickets
- Theme presets, tile sizing, toasts, confirm dialogs, and crash recovery UI
- Live API integration for:
  - auth
  - contacts
  - leads
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
cp .env.example .env
npm run dev
```

The Vite dev server proxies `/api/*` to `VITE_API_PROXY_TARGET`, which defaults to `http://localhost:3000`.

## Build

```bash
npm run build
```

## Environment

The frontend defaults to:

```bash
VITE_API_BASE_URL=/api/v1
```

You can point it directly at a remote backend if needed:

```bash
VITE_API_BASE_URL=https://api.your-domain.com/api/v1
```

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [INDUSTRY_TEMPLATE_ARCHITECTURE.md](./INDUSTRY_TEMPLATE_ARCHITECTURE.md)
