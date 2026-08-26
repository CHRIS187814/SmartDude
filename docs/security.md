# Security

## Row Level Security (RLS)

RLS is enabled on every table. Policies use `auth.uid()` for ownership checks. Users can only access rows they own. No `FOR ALL` policies exist — each CRUD verb has a separate policy.

## Environment Variables

- No API keys or secrets are hardcoded.
- `.env` is gitignored.
- `.env.example` contains only placeholder values.
- Supabase credentials are injected via environment variables at build/deploy time.

## AI Action Safety

- The AI outputs structured, typed actions — never raw SQL or arbitrary database operations.
- All actions require user confirmation before execution.
- Actions execute through the Supabase client, which is subject to RLS.
- The AI cannot delete data, access other users' data, or perform irreversible operations.

## Client-Side

- The frontend uses the Supabase anon key, which is safe to expose (RLS enforces access control).
- No service role keys are used in client code.
- Auth sessions are managed by Supabase Auth with automatic token refresh.
