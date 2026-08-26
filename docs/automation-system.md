# Automation System

## Overview

Automations are recurring scheduled actions stored in the `automations` table with a cron expression (`schedule_cron`). Each automation has:

- An action type (e.g., `CREATE_TASK`, `CREATE_REMINDER`)
- Action parameters (e.g., task title, priority)
- Execution metadata (last run, next run, success/failure, error message)
- Enabled/disabled state

## Scheduling

The `next_run` field is computed client-side using a cron parser (`computeNextRun` in `actionEngine.ts`). When an automation is enabled, the next execution time is calculated and stored.

## Server-Side Execution

For reliable background execution (browser closed), a Supabase Edge Function (`run-automations`) is designed to:

1. Query automations where `next_run <= now()` and `enabled = true`.
2. Execute the action for each due automation.
3. Update `last_run`, `last_success`/`last_failure`, `run_count`.
4. Compute and set the next `next_run`.

This function must be triggered by an external cron scheduler (e.g., Supabase scheduled functions, cron-job.org, GitHub Actions scheduled workflow) at a regular interval (e.g., every minute).

## Failure Handling

- Failures are recorded in `last_failure` and `last_error`.
- The system does not retry automatically — the user can manually re-enable or edit.
- `next_run` is still recalculated after a failure to prevent uncontrolled retry loops.

## Timezone

Schedules are stored as cron expressions. The user's timezone (from their profile) is used when displaying times. The edge function should interpret cron in the user's timezone for accurate execution.
