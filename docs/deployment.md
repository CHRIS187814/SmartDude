# Deployment

## Prerequisites

1. A Supabase project with the database schema applied.
2. Environment variables configured.

## Steps

### 1. Apply Database Schema

The schema is applied via the Supabase MCP `apply_migration` tool. If setting up manually, run the SQL in `supabase/migrations/` against your Supabase project.

### 2. Build

```bash
npm install
npm run build
```

### 3. Deploy

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### 4. Set Environment Variables

In your hosting dashboard, set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 5. Configure Automation Scheduler (Optional)

To enable background automations, set up an external cron trigger that calls the `run-automations` edge function endpoint every minute.

## CI

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, and `npm run build` on every push and pull request to `main`.
