# SmartDude — AI Action Companion

A context-aware AI companion that helps you understand, plan, schedule, remind, and automate your work. SmartDude adapts productivity, tasks, routines, and workflows to your personal and workspace context.

## Demo
<a href="https://smartdude.bolt.host/">
  <img src="https://img.shields.io/badge/🚀%20Open%20SmartDude-blue?style=for-the-badge" alt="Open SmartDude">
</a>

## Core Concept

SmartDude is not just a to-do list. It follows a core loop:

**Understand → Plan → Confirm → Execute → Remind → Automate → Adapt to Context**

The AI companion understands your tasks, projects, schedules, and context — then proposes actions you can confirm with one click.

## Key Features

- **Personal & Workspace Context** — Separate who you are from where you work.
- **Tasks** — Full CRUD with priority, due dates, times, subtasks, projects, and real-time sync.
- **Projects** — Organize tasks with progress tracking and color coding.
- **Notifications** — Real-time in-app notifications with read/unread state.
- **Calendar** — Monthly view of scheduled tasks with priority indicators.
- **Analytics** — Completion rates, 7-day trends, breakdowns by priority and project.
- **AI Companion** — Natural-language chat that creates tasks, reminders, automations, and focus plans.
- **Automations** — Recurring scheduled actions that run via a server-side edge function.
- **Dark/Light Mode** — Full theme support with system preference detection.
- **Responsive Design** — Works from 390px mobile to 1440px+ desktop.
- **Command Palette** — Quick navigation with Cmd/Ctrl+K.

## AI Actions

The AI companion supports these structured action types:

| Action | Description |
|--------|-------------|
| CREATE_TASK | Create a new task with title, priority, due date |
| CREATE_REMINDER | Create a task + scheduled notification |
| CREATE_AUTOMATION | Set up a recurring automation |
| COMPLETE_TASK | Mark a task as done |
| DISABLE_AUTOMATION | Turn off an automation |
| ENABLE_AUTOMATION | Turn on an automation |
| RECOMMEND_PRIORITIES | Analyze and rank your tasks |
| CREATE_FOCUS_PLAN | Generate a time-blocked focus schedule |
| CREATE_PROJECT | Create a new project |

All actions require user confirmation before execution. The AI never directly modifies the database — it outputs structured actions that the application validates and executes.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Icons:** Lucide React
- **AI:** Built-in intent parser + action engine (no external LLM dependency)

## Architecture

```
src/
├── components/        # Reusable UI components
│   ├── ui/            # Primitives (Modal, Spinner, EmptyState)
│   ├── AppShell.tsx   # Sidebar, topbar, mobile nav
│   ├── AiCompanion.tsx # AI chat with action execution
│   ├── CommandPalette.tsx
│   ├── Landing.tsx     # Marketing + auth
│   └── Onboarding.tsx
├── context/           # React contexts (Auth, Theme, Workspace)
├── hooks/             # Data hooks (tasks, projects, notifications, automations)
├── lib/               # Utilities, Supabase client, AI parser, action engine
├── types/             # TypeScript type definitions
└── views/             # Page-level views (Dashboard, Tasks, Projects, etc.)
```

## Local Setup

```bash
npm install
cp .env.example .env  # Fill in your Supabase credentials
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

## Security

- **Row Level Security** is enabled on every table with owner-scoped policies using `auth.uid()`.
- No API keys or secrets are committed to the repository.
- `.env` is gitignored; `.env.example` contains only placeholders.
- AI actions run in the authenticated user's context — the database authorization layer is authoritative.

## Automation Architecture

Automations use a cron-based schedule stored in PostgreSQL. A Supabase Edge Function (`run-automations`) is designed to be triggered by an external scheduler (e.g., Supabase scheduled functions, cron-job.org, or GitHub Actions) to process due automations server-side — even when the user's browser is closed.

## Deployment

1. Push to GitHub.
2. Connect the repository to your hosting provider (Vercel, Netlify, etc.).
3. Set environment variables in the hosting dashboard.
4. Deploy.

## Known Limitations

- The automation edge function requires an external cron trigger to run on schedule.
- Browser push notifications require additional setup (service worker + push provider).
- The AI intent parser is rule-based; an LLM integration would improve natural language understanding.

## Roadmap

- [ ] LLM-powered AI companion integration
- [ ] Browser push notifications
- [ ] Workspace collaboration (multi-user)
- [ ] Mobile app
- [ ] Calendar integration (Google, Outlook)
