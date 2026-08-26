# AI System

## Intent Parser (`src/lib/aiParser.ts`)

The parser uses rule-based pattern matching to convert natural language into structured `AiAction` objects. It handles:

- **Date resolution** — "today", "tomorrow", "in 3 days", "Monday", "8/27"
- **Time resolution** — "7 PM", "morning" (8 AM), "evening" (7 PM), "after lunch" (12:30 PM)
- **Recurrence** — "every weekday", "every Monday", "every day", "every month"
- **Priority detection** — "urgent", "high", "important", "low"
- **Intent classification** — create task, reminder, automation, complete task, disable/enable automation, prioritize, focus plan

## Action Engine (`src/lib/actionEngine.ts`)

Executes validated actions through the Supabase client. Every action:

1. Runs in the authenticated user's context (RLS enforced).
2. Is validated before execution.
3. Returns a success/failure result with a human-readable message.

## Action Types

```typescript
type AiActionType =
  | 'CREATE_TASK' | 'UPDATE_TASK' | 'COMPLETE_TASK'
  | 'CREATE_PROJECT' | 'CREATE_REMINDER'
  | 'CREATE_RECURRING_TASK' | 'CREATE_AUTOMATION'
  | 'UPDATE_AUTOMATION' | 'DISABLE_AUTOMATION' | 'ENABLE_AUTOMATION'
  | 'CREATE_FOCUS_PLAN' | 'RECOMMEND_PRIORITIES'
```

## Confirmation Flow

All actions that modify data require explicit user confirmation in the chat UI. The AI shows a summary of what will happen, and the user clicks "Confirm" or "Cancel".

## Safety

- The AI cannot delete data.
- The AI cannot access other users' data.
- The AI cannot perform arbitrary database operations.
- All actions go through RLS-enforced Supabase queries.
