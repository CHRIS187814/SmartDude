# Architecture

## Overview

SmartDude is a single-page React application backed by Supabase (PostgreSQL + Auth + Realtime).

## Layers

1. **Presentation** (`src/views/`, `src/components/`) — React components and page-level views.
2. **State** (`src/context/`) — Auth, Theme, and Workspace contexts provide global state.
3. **Data** (`src/hooks/`) — Custom hooks wrap Supabase queries and realtime subscriptions.
4. **AI** (`src/lib/aiParser.ts`, `src/lib/actionEngine.ts`) — Intent parsing and action execution.
5. **Database** (Supabase) — PostgreSQL with RLS policies on every table.

## Data Flow

```
User → UI → Hook → Supabase Client → PostgreSQL (RLS enforced)
                    ↑ Realtime subscriptions
```

## AI Action Flow

```
User message → Intent Parser → Structured Action → User Confirmation → Action Engine → Supabase
```

The AI never touches the database directly. It outputs a typed `AiAction` object. The user confirms, then the Action Engine validates and executes through the same Supabase client with RLS enforcement.

## Realtime

Supabase Realtime channels are used for tasks, projects, and notifications. Each channel is scoped to the user's workspace and cleaned up on component unmount.
