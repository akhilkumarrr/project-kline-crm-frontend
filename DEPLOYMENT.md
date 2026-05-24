# Frontend Deployment Guide

## Environment Variables

Start from `.env.example` and set:

- `VITE_API_BASE_URL`
- `VITE_API_PROXY_TARGET` for local Vite development
- `VITE_PREVIEW_PORT` if you want a custom preview port

## Recommended Values

### Local development

```bash
VITE_API_BASE_URL=/api/v1
VITE_API_PROXY_TARGET=http://localhost:3000
```

### Production with same-origin reverse proxy

```bash
VITE_API_BASE_URL=/api/v1
```

### Production with separate API domain

```bash
VITE_API_BASE_URL=https://api.your-domain.com/api/v1
```

## Release Checklist

1. Run `npm run build`
2. Verify login works against the target backend
3. Verify dashboard, contacts, pipeline, tasks, invoices, and analytics load
4. Confirm the backend allows the frontend origin through CORS
5. Confirm the backend health endpoint returns `200` at `/api/v1/health`

## Notes

- The frontend now shows a clearer error if it cannot reach the backend API
- Vite dev proxy is driven by `VITE_API_PROXY_TARGET`
- For production, prefer a same-origin setup behind Nginx or another reverse proxy when possible
