# Database Schema

## Tables

### profiles
- `id` (uuid, PK, references `auth.users`)
- `full_name` (text)
- `role` (text)
- `timezone` (text, default UTC)
- `personal_context` (jsonb)
- `preferences` (jsonb)
- `onboarding_completed` (boolean, default false)

### workspaces
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users, default `auth.uid()`)
- `name` (text)
- `context_type` (text: personal | work | study | custom)
- `workspace_context` (jsonb)
- `color` (text)

### projects
- `id` (uuid, PK)
- `workspace_id` (uuid, FK → workspaces)
- `user_id` (uuid, FK → auth.users)
- `name`, `description`, `color`, `status`, `due_date`

### tasks
- `id` (uuid, PK)
- `workspace_id` (uuid, FK → workspaces)
- `project_id` (uuid, FK → projects, nullable)
- `user_id` (uuid, FK → auth.users)
- `title`, `description`, `priority`, `status`
- `due_date` (date), `due_time` (time), `reminder_at` (timestamptz)
- `recurrence_rule` (text)
- `completed` (boolean), `completed_at` (timestamptz)
- `sort_order` (integer)

### subtasks
- `id`, `task_id` (FK → tasks), `user_id`, `title`, `completed`, `sort_order`

### tags
- `id`, `workspace_id`, `user_id`, `name`, `color`

### task_tags
- `task_id` + `tag_id` (composite PK)

### notifications
- `id`, `user_id`, `type`, `title`, `body`, `read`, `scheduled_for`, `related_task_id`

### automations
- `id`, `user_id`, `workspace_id`, `name`, `description`
- `trigger_type`, `schedule_cron`, `action_type`, `action_params` (jsonb)
- `enabled`, `last_run`, `last_success`, `last_failure`, `last_error`
- `next_run`, `run_count`

### ai_conversations
- `id`, `user_id`, `title`

### ai_messages
- `id`, `conversation_id`, `user_id`, `role`, `content`, `action` (jsonb), `action_status`

### focus_plans
- `id`, `user_id`, `title`, `blocks` (jsonb array of time blocks)

## RLS

Every table has RLS enabled with owner-scoped policies using `auth.uid()`. Users can only access their own data. No `FOR ALL` policies are used — each CRUD verb has a separate policy.
